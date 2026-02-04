const lists = document.querySelectorAll(".list");
const addTask = document.querySelector(".add_button");
const input = document.querySelector(".taskInput");
const categoryInput = document.querySelector(".categoryInput");
const searchInput = document.querySelector(".searchInput"); // cwagner: Get search input element

loadState();

addTask.addEventListener("click", newTask);

// cwagner: Add event listener for search functionality
searchInput.addEventListener("input", filterTasks);

function createCard(id, text, category) {
    const div = document.createElement("div");
    div.classList.add("card");
    div.draggable = true;
    div.id = id;
    
    //wrap the task text in a span so innerText doesn't grab the button later.
    const textSpan = document.createElement("span");
    textSpan.innerText = text; 
    div.appendChild(textSpan);

    //always create a category span
    const categorySpan = document.createElement("div");
    categorySpan.classList.add("category");
    categorySpan.innerText = category || ""; // Use the category or an empty string
    div.appendChild(categorySpan);

    // Only set the dataset if there is a category
    if (category) {
        div.dataset.category = category;
    }

    div.addEventListener("dragstart", dragStart);
    div.addEventListener("dragend", dragEnd);

    //delete functionality
    //adds delete button in each card
    const deleteBtn = document.createElement("button");
    deleteBtn.innerText = "×";
    deleteBtn.classList.add("delete-btn");

    deleteBtn.addEventListener("click", (e) => {
        // e.stopPropagation() prevents the click from triggering 
        // any other listeners on the card itself
        e.stopPropagation(); 
        
        div.remove(); // Removes the card from the screen
        saveState();  // Updates localStorage
    });

    div.appendChild(deleteBtn);

    const editBtn = document.createElement("button");
    editBtn.innerText = "✏️";
    editBtn.classList.add("edit-btn");

    editBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        
        // Find the span inside the card
        const textSpan = div.querySelector("span"); 
        const catSpan = div.querySelector(".category");
        
        // Toggle Edit Mode
        
        const isEditing = textSpan.getAttribute("contenteditable") === "true";
        if (!isEditing) {
            textSpan.setAttribute("contenteditable", "true");
            catSpan.setAttribute("contenteditable", "true");
            catSpan.style.minHeight = "1em"; 
            catSpan.style.border = "1px dashed #ccc";

            textSpan.focus(); // Put the cursor in the text
            editBtn.innerText = "💾"; // Change icon to save disk
            div.draggable = false; // Disable dragging while typing
        } else {
            textSpan.setAttribute("contenteditable", "false");
            catSpan.setAttribute("contenteditable", "false");

            catSpan.style.minHeight = "";
            catSpan.style.border = "";
            div.dataset.category = catSpan.innerText.trim();
            editBtn.innerText = "✏️"; // Change back to pencil
            div.draggable = true;  // Re-enable dragging
            saveState(); // Record the new text to LocalStorage
        }
    });

    div.appendChild(editBtn);

    return div;
}

function newTask() {
    const task = input.value.trim();
    // Read optional category (can be empty string)
    const category = categoryInput ? categoryInput.value.trim() : "";

    if(task === "") return;

    const id = "card-" + Date.now(); // uses current date for a unique id
    const card = createCard(id, task, category);
    
    document.getElementById("list1").appendChild(card);

    input.value=""; //clear the input field for next add
    if (categoryInput) categoryInput.value = ""; // clear category input for next add

    saveState();
}


/* 
loops through the cards. 
dragstart: click and begin to move the mouse
dragend: when you let go of the mouse
*/


/*
loops through each list(to do, in progress, done)
dragover: while a card is hovering over a lsit
dragenter: when a card enters a list boundary
dragleave: when a card leaves a list boundary
drop: fires when you release the mouse over a list

*/

for(const list of lists){
    list.addEventListener("dragover", dragOver);
    list.addEventListener("dragenter", dragEnter);
    list.addEventListener("dragleave", dragLeave);
    list.addEventListener("drop", dragDrop);
}

/*
dataTransfer: similar to a clipboard
setData: stores the id of the card that was grabbed
*/

function dragStart(e){
    e.dataTransfer.setData("text/plain", this.id);
}

function dragEnd(){
    console.log("Drag ended");
}

/*
Default browser prevents dragging a element into other element. 
preventDefault() removes this constraint
*/

function dragOver(e){
    e.preventDefault();
}

/*
adds the class "over" to the list that was entered making us able to change the css property.
*/

function dragEnter(e){
    e.preventDefault();

    this.classList.add("over");
}

/* 
removes the added class
*/

function dragLeave(e){
    this.classList.remove("over");
}

/*
getData(): we get the ID of the card we stored earlier with setData();
getElementById(): we find the specific card
appendChild(card): when we append an existing element, the browser moves it instead of duplicating it
saveState(): calls the saveState function
*/

function dragDrop(e){
    const id = e.dataTransfer.getData("text/plain");

    const card = document.getElementById(id);

    this.appendChild(card);

    this.classList.remove("over");

    saveState();
}

function saveState() {
    const state = {}; //initializes an empty object

    lists.forEach(list => {             //loops through each list
        const listId = list.id;         //gets the specific list id
        /* 
        list.querySelectorAll(".card") gets all the cards under the specific list
        Array.from converts the list of card into an array
        .map(card => card.id) creates a new array containing the id of the cards and the text inside the card
        */
        const cardsData = Array.from(list.querySelectorAll(".card")).map(card => {
            const text = card.querySelector("span").innerText;
            // read category stored on the card (may be undefined)
            const category = card.dataset.category || "";
            // Save id, text, and category so we can restore exactly on load
            return { id: card.id, text: text, category: category };
        });
        
        //adds an entry to the state object. becomes {"todo-list": [{ "id": "card-123", "text": "abcd" }]}
        state[listId] = cardsData;
    });

    //JSON.stringify(state) LocalStorage can only store strings so we turn the state object into a long string
    //setItem stores the string into the browsers memory under the key "dragAndDropState"

    localStorage.setItem("dragAndDropState", JSON.stringify(state));
}

function loadState() {
    //getItem gets the stored text under the key "dragAndDropState"
    const savedState = localStorage.getItem("dragAndDropState");
    if (!savedState) return; //if there is no saved data, function is stopped

    //JSON.parse(savedState) gets that long string and parses it back into an object
    const state = JSON.parse(savedState);

    //loops through the state object
    Object.keys(state).forEach(listId => {
        const list = document.getElementById(listId);
        const cardsData = state[listId];

        //loops through the cardsData
        cardsData.forEach(cardData => {
            let card = document.getElementById(cardData.id);
            //if card is newly made, card will be remade when loaded based on the looped CardsData
            ////If the card doesn't exist in the DOM yet, recreate it from saved data
            if (!card) {
                card = createCard(cardData.id, cardData.text, cardData.category || "");
            }

            if (list) {
                list.appendChild(card);
            }
        });
    });
}

// cwagner: Filter tasks based on search input
// Hides cards that don't match the search term
function filterTasks() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const allCards = document.querySelectorAll(".card");
    
    allCards.forEach(card => {
        const taskText = card.querySelector("span").innerText.toLowerCase();
        // also search category (if present)
        const categoryText = (card.dataset.category || "").toLowerCase();

        // Show card if search is empty or if task text OR category includes search term
        if (searchTerm === "" || taskText.includes(searchTerm) || categoryText.includes(searchTerm)) {
          //if search term is found, card is not hidden. (css)   
            card.style.display = "";
        } else {
            //if search term is not found, card is hidden. (css)
            card.style.display = "none";
        }
    });
}
