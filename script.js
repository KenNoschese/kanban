const cards = document.querySelectorAll(".card");
const lists = document.querySelectorAll(".list");

loadState();

for(const card of cards){
    card.addEventListener("dragstart", dragStart);
    card.addEventListener("dragend", dragEnd);
}

for(const list of lists){
    list.addEventListener("dragover", dragOver);
    list.addEventListener("dragenter", dragEnter);
    list.addEventListener("dragleave", dragLeave);
    list.addEventListener("drop", dragDrop);
}

function dragStart(e){
    e.dataTransfer.setData("text/plain", this.id);
}

function dragEnd(){
    console.log("Drag ended");
}

function dragOver(e){
    e.preventDefault();
}

function dragEnter(e){
    e.preventDefault();

    this.classList.add("over");
}

function dragLeave(e){
    this.classList.remove("over");
}

function dragDrop(e){
    const id = e.dataTransfer.getData("text/plain");

    const card = document.getElementById(id);

    this.appendChild(card);

    this.classList.remove("over");

    saveState();


}

function saveState() {
    const state = {};

    lists.forEach(list => {
        const listId = list.id;
        const cardIds = Array.from(list.querySelectorAll(".card")).map(card => card.id);
        state[listId] = cardIds;
    });

    localStorage.setItem("dragAndDropState", JSON.stringify(state));
}

function loadState() {
    const savedState = localStorage.getItem("dragAndDropState");
    if (!savedState) return;

    const state = JSON.parse(savedState);

    Object.keys(state).forEach(listId => {
        const list = document.getElementById(listId);
        const cardIds = state[listId];

        cardIds.forEach(cardId => {
            const card = document.getElementById(cardId);
            if (card && list) {
                list.appendChild(card);
            }
        });
    });
}