
//Budget Controller
var budgetController=(()=>{
	
	//function constructor
	var Income = function(id,des,val){
		this.id=id;
		this.des=des;
		this.val=val;
	};

	var Expense = function(id,des,val){
		this.id=id;
		this.des=des;
		this.val=val;
		this.percentage=-1;
	};

	Expense.prototype.calcPercentage = function(totalIncome){
		if(totalIncome > 0){
			this.percentage = Math.round((this.val/totalIncome)*100);
		}
		else
		{
			this.percentage = -1;
		}
	}

	Expense.prototype.getPercentage = function(){
		return this.percentage;
	}

	//calculte income and expense

	var calculateTotal = function(type){

		var sum=0;
		data.item[type].forEach(function(cur){
			sum += cur.val;
		});

		data.totals[type] = sum;
	}

	//data structure to store new item
	var data = {
		item : {
			exp : [],
			inc : []	
		},
		totals : {
			exp : 0,
			inc : 0
		},
		budget : 0,
		percentage : -1

	};

	//function to return new item
	return {
		newItem : function(type,des,val){
			var id,additem;
			//creating id
			if(data.item[type].length > 0)
			{
				id = data.item[type][data.item[type].length -1].id + 1;
			}
			else
			{
				id = 0;
			}
			
			//creating new item
			if(type=== 'inc'){
				additem = new Income(id,des,val);
			}
			else if(type === 'exp'){
				additem = new Expense(id,des,val);	
			}

			//adding new item to data
			data.item[type].push(additem);
			return additem;
		},
		calculateBudget : ()=>{

			//calculate income and expense
			calculateTotal('exp');
			calculateTotal('inc');
			//calculate budget income-expense

			data.budget = data.totals.inc - data.totals.exp;
			//calculate percentage of expense over income
			if(data.totals.inc > 0){		
				data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100); 
			}
			else
			{
				data.percentage = -1;
			}
		},

        getBudget : ()=>{
        	return{
        		budget : data.budget,
        		totalInc: data.totals.inc,
        		totalExp: data.totals.exp,
        		percentage: data.percentage
        	}
        },

        calculatePercentage : ()=>{

        	data.item.exp.forEach(function(cur){
        		cur.calcPercentage(data.totals.inc);
        	})
        },

        showPercentage : ()=>{
        	var allPerc = data.item.exp.map(function(cur){
        		return cur.getPercentage();
        	});	
        	return allPerc;
        },

        removeItem : (type,id)=>{

        	var ids;
        	ids = data.item[type].map((current)=>{
        		return current.id;
        	});

        	index = ids.indexOf(id);
        	if(index !== -1){
        	data.item[type].splice(index,1);
        	}
        },

		testing : ()=>{
			console.log(data);
		}
	};
})();


//UI Controller
var UIcontroller= (()=>{
	
	var DomStrings={
		DomType : '.add__type',
		DomDesc : '.add__description',
		DomValue : '.add__value',
		DomBtn : '.add__btn',
		DomIncome : '.income__list',
		DomExpense : '.expenses__list',
		BudgetLabel : '.budget__value',
		IncomeLabel : '.budget__income--value',
		ExpenseLabel : '.budget__expenses--value',
		PercentLabel : '.budget__expenses--percentage',
		Container : '.containers',
		ExpPerLabel: '.item__percentage',
		DateLabel: '.budget__title--month'
	}
	

	var formatNum = (num,type)=>{

		var splitNum,int,dec;

		num = Math.abs(num); // to remove the sign ie. -25 to 25
		num = num.toFixed(2); // 25 to 25.00

		splitNum = num.split('.'); //256.30  ["256","30"]
		int = splitNum[0];

		if(int.length > 3){
			int = int.substr(0,int.length - 3) + ',' + int.substr(int.length - 3, 3);
		}
			
		dec = splitNum[1];

		return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;

	};

	var nodeListForEach = function(list, callback) {

		for(var i=0;i<list.length;i++){
			callback(list[i],i);
		}
	};

	return {
		inputType : ()=>{
			return {
				type : document.querySelector(DomStrings.DomType).value,
    			description : document.querySelector(DomStrings.DomDesc).value,
     			value : parseFloat(document.querySelector(DomStrings.DomValue).value)
 			}
		},
		
		DomString : ()=>{
			return DomStrings;
		},

		displayMonth : ()=>{

			var now, month, months,year;

			now = new Date();
			year = now.getFullYear();
			month = now.getMonth();
			months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
			document.querySelector(DomStrings.DateLabel).textContent = months[month] + ' ' + year;

		},

		addListItem : (obj,type)=>{
			
			//create the html string with some placeholder text
			
			var html,newhtml,element;
			if(type==='inc'){
				element=DomStrings.DomIncome;
				html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="fa fa-trash"></i></button></div></div></div>'
			}
			else if(type==='exp'){
				element=DomStrings.DomExpense;
				html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="fa fa-trash"></i></button></div></div></div>'
			}

			//replace the placeholder with actual data

			newhtml = html.replace('%id%',obj.id);
			newhtml = newhtml.replace('%description%',obj.des);
			newhtml = newhtml.replace('%value%',formatNum(obj.val,type));

			//add item into dom

			document.querySelector(element).insertAdjacentHTML('beforeend',newhtml);
		},

		removeList: (selectorid)=>{

			var el = document.getElementById(selectorid);
			el.parentNode.removeChild(el);
		},

		displayBudget: (obj)=>{

				obj.budget > 0 ? type = 'inc' : type = 'exp'; 

				document.querySelector(DomStrings.BudgetLabel).textContent = formatNum(obj.budget , type);	
			
				document.querySelector(DomStrings.IncomeLabel).textContent = formatNum(obj.totalInc, 'inc');
			
				document.querySelector(DomStrings.ExpenseLabel).textContent = formatNum(obj.totalExp, 'exp');	
			
			if(obj.percentage > 0){
				document.querySelector(DomStrings.PercentLabel).textContent = obj.percentage + '%';
			}
			else{
				document.querySelector(DomStrings.PercentLabel).textContent = '---';	
			}
		},

		displayPercentage : (percentages)=>{

			var fields= document.querySelectorAll(DomStrings.ExpPerLabel);
			nodeListForEach(fields, function(current,index){

				if(percentages[index] > 0){
					current.textContent = percentages[index] + '%';
				}
				else{
					current.textContent = '---';
				}
			});

		},

		changedType : ()=>{

			var fields = document.querySelectorAll(
				DomStrings.DomType+','
				+DomStrings.DomDesc+','
				+DomStrings.DomValue);

			nodeListForEach(fields,function(cur){
				cur.classList.toggle('red-focus');
			});

			document.querySelector(DomStrings.DomBtn).classList.toggle('red');
		},

		clearfields : ()=>{

			// var fields,fieldsArr;

			// fields = document.querySelectorAll(DomStrings.DomDesc + ',' + DomStrings.DomValue);
			// fieldsArr = Array.prototype.slice.call(fields);

			// fieldsArr.forEach(function(current, index, array){
			// 	current.value = "";
			// });

			// fieldsArr[0].focus();

			field1 = document.querySelector(DomStrings.DomDesc);
			field2 = document.querySelector(DomStrings.DomValue);

			field1.value="";
			field2.value="";
			field1.focus();

		}
	}

})();


//Global App Controller
var Controller= ((budgetctrl,UIctrl)=>{

 	var EventListeners= ()=>{
    	var Dom = UIctrl.DomString();
    	document.querySelector(Dom.Container).addEventListener('click',deleteItem);
    	document.querySelector(Dom.DomType).addEventListener('change',UIctrl.changedType);
    	document.querySelector(Dom.DomBtn).addEventListener('click',addItem);
	    document.addEventListener('keypress',(event)=>{
			if(event.keyCode===13 || event.which===13)
			{
				addItem();
			}
	    });
    }

	var addItem = ()=> {
		var inputValues,items;
		//1. Take values
		inputValues=UIctrl.inputType();

		if(inputValues.description != "" && inputValues.value > 0 && !isNaN(inputValues.value)){
		//2. Add the item to structure
		items=budgetctrl.newItem(inputValues.type,inputValues.description,inputValues.value);
		
		//3. Add the item to UI
		UIctrl.addListItem(items,inputValues.type);
		
		//4. Clear the fields
		UIctrl.clearfields();

		//5. Update Budget
        UpdateBudget();

        //6. update percentage
        UpdatePercentages(); 
		}
    }


    var deleteItem = (event)=>{

    	var itemID,type,id,splitId;	
   		itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
	    if(itemID){
	        splitId = itemID.split('-');
	    	type = splitId[0];
	    	id = parseInt(splitId[1]);

	    	//1. remove item in schema
	    	budgetctrl.removeItem(type,id);

	    	//2. remove item in UI
	    	UIctrl.removeList(itemID);

	    	//3. update the budget
			UpdateBudget();

			//4. update percentage
			UpdatePercentages();

	 	}	
    }

 	
    var UpdateBudget = ()=>{

		//1. Calculate budget
		budgetctrl.calculateBudget();	
		//2. Return budget
		var Budget = budgetctrl.getBudget();
		//3. Update on UI
		UIctrl.displayBudget(Budget);
	
	}

	 var UpdatePercentages = ()=>{

		//1. Calculate Percentage
		budgetctrl.calculatePercentage();	
		//2. Return Percentage
		var data = budgetctrl.showPercentage();
		//3. Update on UI
		UIctrl.displayPercentage(data);	
	}

    return {
    	init : ()=>{
    		console.log("App Started"); 
    		UIctrl.displayMonth();
    		UIctrl.displayBudget({
    			budget : 0,
        		totalInc: 0,
        		totalExp: 0,
        		percentage: -1
    		});
    		return EventListeners();
    	}
    }

})(budgetController,UIcontroller);

Controller.init();