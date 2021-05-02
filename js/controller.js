// контроллер управляет данными и внешним видом, поэтому должен принимать в себя и модель, и view
var controller = (function(budgetCtrl, uiCtrl) {

    // функция, прослушывающая события
    var setupEventListeners = function() {
        var DOM = uiCtrl.getDomStrings()
        document.querySelector(DOM.form).addEventListener("submit", ctrlAddItem);

        // клик по таблице с доходами и расходами
        document.querySelector(DOM.budgetTable).addEventListener("click", ctrlDeleteItem)
    }

    // обновляем проценты у каждой записи
    function updatePercentages() {

        // 1. посчитать проценты для каждой записи типа Expense
        budgetCtrl.calculatePercentages();
        budgetCtrl.test();

        // 2. Получаем данные по процентам с модели
        var idsAndPercents = budgetCtrl.getAllIdsAndPercentages();

        // 3. Обновить UI с новыми процентами
        uiCtrl.updateItemsPercentages(idsAndPercents);
    }

    // функция, которая срабатывает при отправке формы
    function ctrlAddItem(event) {
        // отменяем отправку формы
        event.preventDefault();

        // чтобы метод getInput работал, надо его вызвать, также запишем результат метода в переменную
        // 1. получаем данные из формы
        var input = uiCtrl.getInput();

        // проверка на то, что поля не пустые
        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            // 2. добавляем полученные данные в модель
            // теперь в объекте newItem содержатся данные о новой записи
            var newItem = budgetCtrl.addItem(input.type, input.description, input.value);
            budgetCtrl.test();

            // 3. добавляем "запись" в UI
            uiCtrl.renderListItem(newItem, input.type);
            // очищаем поля
            uiCtrl.clearFields();
            generateTestData.init();

            // 4. Считаем бюджет
            updateBudget();

            // 5. Пересчитали проценты
            updatePercentages();
        }

    }

    // функция по удалению строчки
    function ctrlDeleteItem(event) {

        var itemID, splitID, type, ID;
        // ищем кнопку удалить и проверяем, кликаем ли по ней
        if (event.target.closest(".item__remove")) {

            // узнаем id родителя кнопки, по которой кликаем, то есть id записи, которую надо удалить
            itemID = event.target.closest("li.budget-list__item").id;

            // разбиваем id на 2 части, на тип (inc / exp) и номер
            splitID = itemID.split("-"); // "inc-1" -> ["inc", "1"]
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // удаление записи из модели
            budgetCtrl.deleteItem(type, ID);

            // удаление записи из шаблона
            uiCtrl.deleteListItem(itemID);

            // обновляем бюджет
            updateBudget();

            // пересчитали проценты
            updatePercentages();
        }

    }

    // функция - пересчет бюджета
    function updateBudget() {
        // 1. Рассчитать бюджет в модели
        budgetCtrl.calculateBudget();

        // 2. Получить рассчитанный бюджет из модели
        // метод возвращает объект, поэтому запишем его в переменную budgetObj
        budgetObj = budgetCtrl.getBudget();

        // 3. Отобразить бюджет в шаблоне
        uiCtrl.updateBudget(budgetObj);
    }

    return {
        init: function() {
           console.log("App started!");
           uiCtrl.displayMonth();
           setupEventListeners();
           uiCtrl.updateBudget({
            budget: 0,
            totalInc: 0,
            totalExp: 0,
            percentage: 0
           }); 
        }
    }

})(modelController, viewController);

controller.init();
