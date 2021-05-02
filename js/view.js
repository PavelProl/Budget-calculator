// шаблон заведует тем, что возвращает нам какие-то данные из разметки, либо какие-то наши данные заносит в разметку
var viewController = (function() {

    var DOMstrings = {
        inputType: "#input__type",
        inputDescrition: "#input__description",
        inputValue: "#input__value",
        form: "#budget-form",
        incomeContainer: "#income__list",
        expenseContainer: "#expenses__list",
        // контейнер для бюджета
        budgetLabel: "#budget-value",
        incomeLabel: "#income-label",
        expensesLabel: "#expense-label",
        expensesPercentLabel: "#expense-percent-label",
        budgetTable: "#budget-table",
        monthLabel: "#month",
        yearLabel: "#year"
    }

    function getInput() {
        return {
            type: document.querySelector(DOMstrings.inputType).value,
            description: document.querySelector(DOMstrings.inputDescrition).value,
            value: document.querySelector(DOMstrings.inputValue).value
        }
    }

    function formatNumber(num, type) {

        var numSplit, int, dec, newInt, resultNumber;
        /* 
        1. будем добавлять + или - перед числом в зависимости от типа

        2. два знака после точки, десятые и сотые
        50 => 50.00

        3. 87.56383298 => 87.56
        */

        /*
        закомментирован более развернутые способ
        // убираем знак минус у отрицательных чисел
        num = Math.abs(num); // Math.abs(-10) = 10

        // приводим к 2-м цифрам после запятой
        num = num.toFixed(2); // (2.3483).toFixed(2) = 2.35

        // 123000 => 123,000.00

        numSplit = num.split("."); // 34.37 => [34, 37]
        // целая часть
        int = numSplit[0]; // 34
        // десятичная часть
        dec = numSplit[1]; // 37 
        */

        // более короткий способ
        var [int, dec] = Math.abs(num).toFixed(2).split(".");

        // Расставляем запятые
        // Исходя из длины числа делим его на части по 3 цифры
        // Начиная с правой стороны проставляем запятые после каждого третьего числа
        // 123456789 => 123,456,789
        // Если длина номера больше, чем 3 цифры, значит надо ставить запятые

        /*
        if (int.length > 3) {
            newInt = "";

            // 123456789

            for (var i = 0; i < int.length / 3; i++) {

                // формируем новую строку с номером, добавляем запятую каждые 3 числа
                // substring - вырезаем подстроку из строки на основе индекса
                newInt = "," + int.substring(int.length - 3 * (i + 1), int.length - 3*i) + newInt;
            }

            // убираем запятую в начале, если она есть
            if (newInt[0] === ",") {
                newInt = newInt.substring(1);
            }

        // если исходное число равно нулю, то в новую строку записываем ноль
        } else if (int === "0") {
            newInt = "0";
        // если исходное число имеет 3 и менее символов
        } else {
            newInt = int;
        }

        resultNumber = newInt + "." + dec;

        if (type === "exp") {
            resultNumber = "- " + resultNumber;
        } else if (type === "inc") {
            resultNumber = "+ " + resultNumber;
        }

        return resultNumber;
        */

        newInt = new Intl.NumberFormat("en-GB").format(int);
        resultNumber = newInt + "." + dec + " \u20BD";

        if (int !== "0") {
            resultNumber = type ? type === "exp" ? "- " + resultNumber : "+ " + resultNumber : "";
        }

        return resultNumber;
        
    }
    
    // будет принимать объект с данными записи и type - куда данные относятся
    function renderListItem(obj, type) {
        var containerElement, html;

        if (type === "inc") {
            containerElement = DOMstrings.incomeContainer;
            html = `<li id="inc-%id%" class="budget-list__item item item--income">
            <div class="item__title">%description%</div>
            <div class="item__right">
                <div class="item__amount">%value%</div>
                <button class="item__remove">
                    <img
                        src="./img/circle-green.svg"
                        alt="delete"
                    />
                </button>
            </div>
        </li>`;
        } else {
            containerElement = DOMstrings.expenseContainer;
            html = `<li id="exp-%id%" class="budget-list__item item item--expense">
            <div class="item__title">%description%</div>
            <div class="item__right">
                <div class="item__amount">%value%<div class="item__badge">
                        <div class="item__percent badge badge--dark">
                            15%
                        </div>
                    </div>
                </div>
                <button class="item__remove">
                    <img src="./img/circle-red.svg" alt="delete" />
                </button>
            </div>
        </li>`;
        }

        // первым аргументом - ищет подстроку, вторым аргументом - на что поменять. В итоге получаем новую строчку с обновленными плэйсхолдерами
        newHtml = html.replace("%id%", obj.id);
        newHtml = newHtml.replace("%description%", obj.description);
        newHtml = newHtml.replace("%value%", formatNumber(obj.value, type));


        // получили данные, получили тип, определили какой тип, получили нужную разметку, теперь можем эту разметку вставлять в DOM. Далее вставим значения в разметку
        // ищем на странице нужный контейнер, куда будем вставлять
        document.querySelector(containerElement).insertAdjacentHTML("beforeend", newHtml);
    }

    // функция по очистке полей
    function clearFields() {
        var inputDesc, inputVal;

        // Ищем поля для сброса
        inputDesc = document.querySelector(DOMstrings.inputDescrition);
        inputVal = document.querySelector(DOMstrings.inputValue);

        inputDesc.value = "";
        inputDesc.focus();
        inputVal.value = "";

    }

    // функция по отображению бюджета в шаблоне
    function updateBudget(obj) {

        var type;

        if (obj.budget > 0) {
            type = "inc";
        } else {
            type = "exp";
        }
        
        // ищем текстовое содержимое лэйбла и заменяем на содержимое переданного объекта
        document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
        document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, "inc");
        document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, "exp");
        if (obj.percentage > 0) {
            document.querySelector(DOMstrings.expensesPercentLabel).textContent = obj.percentage;
        } else {
            document.querySelector(DOMstrings.expensesPercentLabel).textContent = "--"; 
        }
        
    }

    // функция по удалению строчки в шаблоне
    function deleteListItem(itemID) {
        document.getElementById(itemID).remove();
    }

    function updateItemsPercentages(items) {
        items.forEach(function(item) {

            // ищем элемент li, а в нем процент
            var el = document.getElementById(`exp-${item[0]}`).querySelector(".item__percent");

            if (item[1] >= 0) {
                // если доходы есть, то есть проценты есть, то показываем el
                el.parentElement.style.display = "block";
                // меняем текстовое содержимое
                el.textContent = item[1] + "%";
            } else {
                el.parentElement.style.display = "none";
            }
        })
    }

    function displayMonth() {

        var now;

        now = new Date();
        year = now.getFullYear(); // 2020
        month = now.getMonth(); // январь -> 0, апрель -> 3

        monthArr = [
            'Январь', 'Февраль', 'Март',
            'Апрель', 'Май', 'Июнь',
            'Июль', 'Август', 'Сентябрь',
            'Октябрь', 'Ноябрь', 'Декабрь'
        ];

        month = monthArr[month];

        document.querySelector(DOMstrings.monthLabel).innerText = month;
        document.querySelector(DOMstrings.yearLabel).innerText = year;

    }

    // getInput - метод, который получает данные и возвращает их в виде объекта (далее их надо получить в контроллере и как-то работать с ними)
    return {
        getInput: getInput,
        renderListItem: renderListItem,
        clearFields: clearFields,
        updateBudget: updateBudget,
        deleteListItem: deleteListItem,
        updateItemsPercentages: updateItemsPercentages,
        displayMonth: displayMonth,
        getDomStrings: function() {
            return DOMstrings
        }
    }

})();