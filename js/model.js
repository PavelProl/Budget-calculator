// всеми данными заведует модель, она их и принимает , и возвращает
var modelController = (function() {

    // конструктор доходов
    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    }

    // конструктор расходов
    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
        // -1 значит, что проценты пока не установлены
    }

    // метод, который будет рассчитывать, сколько от данного бюджета занимает конкретный объект с расходом
    Expense.prototype.calcPercentage = function(totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    }

    Expense.prototype.getPercentage = function() {
        return this.percentage;
    }

    // функция будет создавать новый доход или новый расход
    function addItem(type, desc, val) {
        var newItem, ID = 0;

        // [ 1 2 3 4 5 6 ] // next ID = 7
        // [ 1 2 3 4 5 6 7 ] // next ID = 8
        // [ 1 4 8 12] // next ID = last ID + 1, потому что часть элементов, возможно, будут удалены, и мы будем опираться на последний ID

        // получаем следующий ID (+ сразу проверка на пустой массив)
        if (data.allItems[type].length > 0) {
            var lastIndex = data.allItems[type].length - 1;
            ID = data.allItems[type][lastIndex].id + 1;
        }

        // в зависимости от типа записи используем соответствующий конструктор и создаем объект
        if (type === "inc") {
            newItem = new Income(ID, desc, parseFloat(val));
        } else if (type === "exp") {
            newItem = new Expense(ID, desc, parseFloat(val));
        }

        // помещаем созданный объект в массив inc или exp в зависимости от type
        data.allItems[type].push(newItem);

        // возвращаем новый объект
        return newItem;
    }

    function deleteItem(type, id) {

        /*
        // метод map будет проходиться по массиву inc или exp и возвращать новый массив c айдишками
        var ids = data.allItems[type].map(function(item) {
            return item.id;
        });

        // находим индекс записи
        var index = ids.indexOf(id);
        */

        // более короткий путь поиска индекса в массиве - метод findIndex
        const index = data.allItems[type].findIndex(item => item.id === id)

        // удаляем запись из массива
        if (index !== -1) {
            data.allItems[type].splice(index, 1);
        }
        
        console.log(data.allItems);

    }

    function calculateTotalSum(type) {
        /*var sum = 0;
        data.allItems[type].forEach(function(item) {
            sum = sum + item.value;
        });

        return sum;*/

        // метод массива reduce (взамен кода выше)
        return data.allItems[type].reduce((accumulator, item) => accumulator + item.value, 0);
    }

    // рассчитываем бюджет
    function calculateBudget() {
        // считаем все доходы
        data.totals.inc = calculateTotalSum("inc");

        // считаем все расходы
        data.totals.exp = calculateTotalSum("exp");

        // считаем общий бюджет
        data.budget = data.totals.inc - data.totals.exp;

        // считаем процент (от доходов) для расходов
        if (data.totals.inc > 0) {
            data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
        } else {
            data.percentage = -1;
        }
    }

    // возвращаем объект с бюджетом
    function getBudget() {
        return {
            budget: data.budget,
            totalInc: data.totals.inc,
            totalExp: data.totals.exp,
            percentage: data.percentage
        }
    }

    // проходимся по всем объектам с расходами и высчитываем у каждого проценты
    function calculatePercentages() {
        data.allItems.exp.forEach(function(item) {
            item.calcPercentage(data.totals.inc);
        })
    }

    // функция, которая будет возвращать список id и список процентов, которые надо обновить во view
    function getAllIdsAndPercentages() {
        // возвращаем массив с данными [id, %] и записываем в переменную allPerc
        var allPerc = data.allItems.exp.map(function(item) {
            return [item.id, item.getPercentage()];
        });

        return allPerc;
    }

    // объект со всеми данными приложения
    var data = {
        allItems: {
            inc: [],
            exp: []
        },
        totals: {
            inc: 0,
            exp: 0
        },
        budget: 0,
        percentage: -1
        // если минус 1, то это значит, что проценты не заданы, и мы не будем их выводить
    }

    // возвращаем объект, чтобы можно было обратиться к данной модели в контроллере и вызвать метод addItem
    return {
        addItem: addItem,
        calculateBudget: calculateBudget,
        getBudget: getBudget,
        deleteItem: deleteItem,
        calculatePercentages: calculatePercentages,
        getAllIdsAndPercentages: getAllIdsAndPercentages,
        // функция для распечатывания объекта data для визуальной проверки
        test: function() {
            console.log(data)
        }
    }

})();