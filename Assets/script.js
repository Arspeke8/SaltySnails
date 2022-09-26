var addChecklistItemEl = document.querySelector("#add-checklist-item");
var checklistSubmitBtn = document.querySelector("#checklist-submit");
var checklistEl = document.querySelector(".checklist");

var checklistArray = [];

// Renders checklist items as <li> elements
function renderChecklist() {
    checklistEl.innerHTML = "";

    for (var i = 0; i < checklistArray.length; i++) {
        var checklistItemText = checklistArray[i];

        var checklistItem = document.createElement("label");
        checklistItem.classList.add("checkbox");
        checklistItem.innerHTML = "<input type='checkbox'>" + checklistItemText;
        
    }
}

// Stores checklist array in local storage
function storeChecklist() {
    localStorage.setItem("checklist", JSON.stringify(checklistArray));
}

// When user clicks submit after typing checklist item
checklistSubmitBtn.addEventListener("click", function(event) {
    event.preventDefault();

    var item = addChecklistItemEl.value.trim();
    
    // Returns from function early if item is blank
    if(item === "") {
        return;
    }

    // Adds checklist item to checklist array and clears input box
    checklistArray.push(item);
    addChecklistItemEl.value = "";

    storeChecklist();
    renderChecklist();
});