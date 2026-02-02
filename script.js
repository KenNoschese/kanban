const cards = document.querySelectorAll(".card");
const lists = document.querySelectorAll(".list");
const addTask = document.querySelector(".add_button");
const input = document.querySelector(".taskInput");

loadState();

addTask.addEventListener("click", newTask);

function newTask() {
    const task = input.value.trim();

    if(task === "") return;

    const div = document.createElement("div");
    div.classList.add("card");
    div.draggable = true;
    div.id = "card-" + Date.now(); // uses current date for a unique id
    div.innerText = task;

    div.addEventListener("dragstart", dragStart);
    div.addEventListener("dragend", dragEnd);

    const list = document.getElementById("list1");
    list.appendChild(div);

    input.value="";

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

    saveState();
}


/* 
loops through the cards. 
dragstart: click and begin to move the mouse
dragend: when you let go of the mouse
*/

for(const card of cards){
    card.addEventListener("dragstart", dragStart);
    card.addEventListener("dragend", dragEnd);
}

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
            return { id: card.id, text: card.innerText };
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
            if (!card) {
                //same logic sa new task
                card = document.createElement("div");
                card.id = cardData.id;
                card.classList.add("card");
                card.draggable = true;
                card.innerText = cardData.text;

                const deleteBtn = document.createElement("button");
                deleteBtn.innerText = "×";
                deleteBtn.classList.add("delete-btn");

                deleteBtn.addEventListener("click", (e) => {
                    // e.stopPropagation() prevents the click from triggering 
                    // any other listeners on the card itself
                    e.stopPropagation(); 
                    
                    card.remove(); // Removes the card from the screen
                    saveState();  // Updates localStorage
                });

                card.appendChild(deleteBtn);

                card.addEventListener("dragstart", dragStart);
                card.addEventListener("dragend", dragEnd);
            }

            if (list) {
                list.appendChild(card);
            }
        });
    });
}