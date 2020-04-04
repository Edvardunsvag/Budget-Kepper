

//BUDGET CONTROLLER
var budgetController = (function(){

    var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
        this.calculatePercentages = function(totalIncome){
            if(totalIncome > 0){
                this.percentage = Math.round((this.value / totalIncome) * 100);
            } else{
                this.percentage = -1;
            }
        }
    };

    var Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function(type){
        var sum = 0;
        data.allItems[type].forEach(function(cur){
            sum += cur.value
        });

        data.total[type] = sum;
    }

    var updateCurrencyValue = function(){

        if (data.currency === 'NOK' && data.prevCurrency === 'EUR'){
            data.allItems.inc.forEach(function(cur){
                cur.value = cur.value * 11;
            });
            data.allItems.exp.forEach(function(cur){
                cur.value = cur.value * 11;
            });
        } else if (data.currency === 'EUR' && data.prevCurrency === 'NOK'){
            data.allItems.inc.forEach(function(cur){
                cur.value = cur.value * 0.09;
            });
            data.allItems.exp.forEach(function(cur){
                cur.value = cur.value * 0.09;
            });
        }
    };


    var data = {
        allItems : {
            exp: [],
            inc: []
        },
        total: {
            exp: 0,
            inc: 0
        },
        budget : 0,
        percentage : -1,
        currency : "EUR",
        prevCurrency : "EUR"
    };

    return {
        addItem: function(type, des, val){
            var newItem, ID;

            //Create new ID
            if(data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else{
                ID = 0;
            }


            //Create new item based on inc or exp type
            if(type === 'exp'){
                newItem = new Expense(ID, des, val)
            }else if(type === 'inc'){
                newItem = new Income(ID, des, val)
            }

            //push it into data structure. [type] find the array with the name of type
            data.allItems[type].push(newItem);
            return newItem
        },

        //lagde en privat variabel calculateTotal
        calculateBudget : function(){

            //calculate correct currency-balance
            updateCurrencyValue();

            //calc total exp and inc
            calculateTotal('exp');
            calculateTotal('inc');



            data.budget = data.total.inc - data.total.exp

            //cal percentage
            if(data.total.inc > 0){
                data.percentage = Math.round((data.total.exp / data.total.inc) * 100);
            }else{
                data.percentage = -1;
            }
        },

        calculatePercentages : function(){
            data.allItems.exp.forEach(function(current){
                current.calculatePercentages(data.total.inc);
            })
        },

        getPercentages : function(){
            percentagesArr = data.allItems.exp.map(function(current){
                return current.percentage;
            });
            return percentagesArr;
        },

        getIncomeValues : function(){
            incValuesArr = data.allItems.inc.map(function(current){
                return current.value;
            });
            return incValuesArr;
        },

        getExpenseValues : function(){
            expValuesArr = data.allItems.exp.map(function(current){
                return current.value;
            })
            return expValuesArr;
        },

        getBudget : function(){
            return {
                budget : data.budget,
                percentage : data.percentage,
                totalIncome : data.total.inc,
                totalExpense : data.total.exp
            };

        },

        deleteItem : function(type, id){
            var ids, index;

            ids = data.allItems[type].map(function(current){
                return current.id;
            });
            index = ids.indexOf(id);

            if(index !== -1){
                data.allItems[type].splice(index, 1);
            }
        },

        updateCurrency : function(event){
            var currency = event.target.value;
            data.currency = currency;
        },

        updatePrevCurrency : function(){
            var prevCurrency = data.currency
            data.prevCurrency = prevCurrency;
        },

        getCurrency : function(){
            return data.currency;
        },

        getPrevCurrency : function(){
            return data.prevCurrency;
        },

        testing: function(){
            console.log(data);
        }
    }

})();



//UI CONTROLLER
var UIController = (function(){
    var DOMstring = {
        inputType : ".add__type",
        inputDescription : ".add__description",
        inputValue : ".add__value",
        inputBtn : ".add__btn",
        incomeContainer : ".income__list",
        expensesContainer : ".expenses__list",
        budgetLabel : ".budget__value",
        incomeLabel : ".budget__income--value",
        expenseLabel : ".budget__expenses--value",
        percentageLabel : ".budget__expenses--percentage",
        container : ".container",
        expensesPercLabel : ".item__percentage",
        monthLabel : ".budget__title--month",
        changeColorLabel : ".add__type",
        currencyLabel : ".add__currency",
        itemValueInc : ".item__value__inc",
        itemValueExp : ".item__value__exp"
    };

    var formatNumber = function(num, type, currency){

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split(".");

        int = numSplit[0];
        if(int.length > 3){
            int = int.substr(0, int.length - 3) + "," + int.substr(int.length - 3, 3);
        }
        dec = numSplit[1]


        //230420

        return type === 'exp' ? '-' + int + "." + dec +" " + currency : '+' + int + "." + dec +" " + currency;
    };


    var nodeListForEach = function(list, callback){
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    }

    return {
        getinput : function(){
            return { //When you want to return 3 variables, return an object
                type : document.querySelector(DOMstring.inputType).value, //Will be either inc or exp
                description : document.querySelector(DOMstring.inputDescription).value,
                value : parseFloat(document.querySelector(DOMstring.inputValue).value)
            };
        },


        addListItem: function(obj, type, currency){
            var html, newHtml, element;

            if (type === 'inc'){
                element = DOMstring.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value__inc">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            else if(type === 'exp'){
                element = DOMstring.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value__exp">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }

            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type, currency));
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        updateListItem : function(incVal, expVal, currency){
            var fieldsInc = document.querySelectorAll(DOMstring.itemValueInc);
            var fieldsExp = document.querySelectorAll(DOMstring.itemValueExp);

            nodeListForEach(fieldsInc, function(list, index){
                list.textContent = formatNumber(incVal[index], 'inc', currency);
            });

            nodeListForEach(fieldsExp, function(list, index){
                list.textContent = formatNumber(expVal[index], 'exp', currency);
            });


        },

        deleteListItem : function(selectorID){
            var item = document.getElementById(selectorID);
            item.remove();
        },

        getDOMstring : function(){
            return DOMstring;
        },

        clearFields : function(){
            var fields, fieldsArray;
            fields = document.querySelectorAll(DOMstring.inputDescription + ", "  + DOMstring.inputValue);
            fieldsArray = Array.prototype.slice.call(fields);   //Gjør fields om til en array i steden for list, og returnerer den


            fieldsArray.forEach(function(current){
                current.value = "";
            });
            fieldsArray[0].focus();
        },

        displayBudget : function(obj, currency){
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMstring.budgetLabel).textContent = formatNumber(obj.budget, type, currency);
            document.querySelector(DOMstring.incomeLabel).textContent = formatNumber(obj.totalIncome, 'inc', currency);
            document.querySelector(DOMstring.expenseLabel).textContent = formatNumber(obj.totalExpense, 'exp', currency);

            if(obj.percentage > 0){
                document.querySelector(DOMstring.percentageLabel).textContent = obj.percentage + "%";
            } else{
                document.querySelector(DOMstring.percentageLabel).textContent = "---";
            }

        },

        displayPercentages : function(percentArr){
            //Henter alle som har classenavnet ".item__percentage"
            var fields = document.querySelectorAll(DOMstring.expensesPercLabel);

            //lager en metode som går


            nodeListForEach(fields, function(list, index){
                if(percentArr[index] > 0){
                    list.textContent = percentArr[index] + '%';
                } else{
                    list.textContent = percentArr[index] + '---';
                }

            });
        },

        // 222,000



        displayMonth : function(){
            var d = new Date();
            var n = d.getMonth();
            var months = ["January", "February", "March", "April"]
            document.querySelector(DOMstring.monthLabel).textContent = months[n];
        },

        changedType : function(){
            var fields = document.querySelectorAll(
                DOMstring.inputType + ","+
                DOMstring.inputDescription +"," +
                DOMstring.inputValue
            );

            nodeListForEach(fields, function(current){
                current.classList.toggle('red-focus');
            });
            document.querySelector(DOMstring.inputBtn).classList.toggle('red')

        }


    }
})();



//GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl){

    var updateBudget = function(){

        //calc the budget
        budgetCtrl.calculateBudget();

        //return the budget
        var budget = budgetCtrl.getBudget()

        //display the budget
        UICtrl.displayBudget(budget, budgetCtrl.getCurrency());
    }

    var updatePercentages= function(){
        //calc percentages
        budgetCtrl.calculatePercentages();

        //return percentage
        var percentages = budgetCtrl.getPercentages();

        //update percentage in the UI
        UICtrl.displayPercentages(percentages);
    }

    var setupEventListeners = function(){
        var DOM = UIController.getDOMstring();

        document.querySelector(DOM.inputBtn).addEventListener("click", function(){
            ctrlAddItem()
        });

        document.addEventListener('keypress', function(event){
            if(event.keyCode === 13 || event.which === 13){ //Which is for older browsers
                ctrlAddItem()
            }
        });

        //henter fra DOM variabel over. Utfører click når man trykker på DOM.container.
        document.querySelector(DOM.container).addEventListener('click', function(){
            ctrlDeleteItem(event);
        });

        document.querySelector(DOM.changeColorLabel).addEventListener("change", function(){
            UICtrl.changedType();
        });

        document.querySelector(DOM.currencyLabel).addEventListener("change", function(event){
            changeCurrency(event);

        });
    }

    var changeCurrency = function(event){
        //1. get currency
        budgetCtrl.updateCurrency(event)

        //2. Update budget
        updateBudget()

        //3. update items
        var incValues = budgetCtrl.getIncomeValues();
        var expValues = budgetCtrl.getExpenseValues()
        UICtrl.updateListItem(incValues, expValues, budgetCtrl.getCurrency());

        //Update previoulsy currency
        budgetCtrl.updatePrevCurrency();
    };


    var ctrlAddItem = function(){
        var input, newItem;

        //1. get the field input data
        input = UICtrl.getinput();

        if (input.description != "" && !isNaN(input.value) && input.value != 0){


            //2. Add the item to the budget controller
            newItem = budgetController.addItem(input.type, input.description, input.value)

            //3. Add the new item to the user interface
            UICtrl.addListItem(newItem, input.type, budgetCtrl.getCurrency());

            //4.clear the fields
            UIController.clearFields()

            //5. Update budget
            updateBudget(budgetCtrl.getCurrency());

            //6. updatePercentages
            updatePercentages();



        }

    };

    var ctrlDeleteItem = function(event){
        var itemId, splitID, type, id;
        itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemId){
            splitID = itemId.split('-');
            type = splitID[0];
            id = parseInt(splitID[1]);

            //Delete item from data structure
            budgetController.deleteItem(type, id);

            //Delete item from UI
            UICtrl.deleteListItem(itemId);

            //Update budget
            updateBudget(budgetCtrl.getCurrency())

            //Update percentage
            updatePercentages();
        }
    }

    return{
        init : function(){
            console.log("Started app");
            document.querySelector('.add__description').focus();
            UICtrl.displayMonth()
            UICtrl.displayBudget({
                budget : 0,
                percentage : 0,
                totalIncome : 0,
                totalExpense : 0,
            }, 'EUR');
            setupEventListeners();

        }
    }

})(budgetController, UIController);

controller.init();
