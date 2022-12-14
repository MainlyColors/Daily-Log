const formEl = document.querySelector('#log-form--js');
const newItemFormEl = document.querySelector('#newItem-form--js');
const itemContainerList = document.querySelectorAll('#item--js');
const confirmButtonEl = document.querySelector('#confirm-btn--js');
const addButtonEl = document.querySelector('.add');
const deleteButtonEl = document.querySelector('.delete');
const addItemPopUpBoxEl = document.querySelector('#add-dialog-box--js');
const animationEl = document.querySelector('#animation--js');
const resetBtnEl = document.querySelector('#reset-btn--js');
const userInputBoxEl = document.querySelector('#userInputBox');

//------------------------
//----event listeners-----
//------------------------

formEl.addEventListener('submit', async (e) => {
  e.preventDefault();
  // get all deleted items
  const allDeletedElements = document.querySelectorAll('.delete-item');
  const deletedItemNameArr = Array.from(allDeletedElements).map((el) =>
    el.textContent.trim()
  );

  // send delete request
  if (allDeletedElements.length !== 0) {
    const rawResponse = await fetch('/delete', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(deletedItemNameArr),
    });

    // wait for it back
    const content = await rawResponse.json();
    console.log(content);
  }

  // update request
  const allCompletedItemElements = document.querySelectorAll(
    '.completed-checkbox--js:checked'
  );
  // grab just textContext
  const allCompleteItemArr = Array.from(allCompletedItemElements).map((el) =>
    el.parentNode.textContent.trim()
  );

  // only run if we have some checks
  if (allCompleteItemArr !== 0) {
    const rawResponse = await fetch('/update', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(allCompleteItemArr),
    });

    // wait for it back
    const content = await rawResponse.json();
    console.log(content);
  }

  console.log(allCompleteItemArr);

  // location.reload();
});

Array.from(itemContainerList).map((el) =>
  el.addEventListener('click', handleItemContainerClick)
);

addButtonEl.addEventListener('click', (e) => {
  // animationEl.classList.remove('closeDoor');
  addItemPopUpBoxEl.classList.toggle('hidden');
  animationEl.classList.toggle('openDoor');
});

deleteButtonEl.addEventListener('click', (e) => {
  const allLabelElements = document.querySelectorAll('label');

  addDeleteBtnToAllListItems(allLabelElements);
});

// new item form
newItemFormEl.addEventListener('submit', (e) => {
  e.preventDefault();

  if (userInputBoxEl.value === '') return;

  submitNewItemToDB(userInputBoxEl.value);
  confirmButtonEl.insertAdjacentElement(
    'beforebegin',
    createLogItemEl(userInputBoxEl.value)
  );
  // reset input
  userInputBoxEl.value = '';
  // close add form
  // animationEl.classList.toggle('closeDoor');
  animationEl.classList.toggle('openDoor');
  addItemPopUpBoxEl.classList.toggle('hidden');
});

// reset add box input on reset button click
resetBtnEl.addEventListener('click', (e) => {
  userInputBoxEl.value = '';
});

//--------------------------
//----utility functions-----
//--------------------------

function handleItemContainerClick(e) {
  const parentNode = e.target.parentNode;
  let timeStampEl;
  // if div parent is clicked
  if (Array.from(e.target.classList).includes('item-container')) return null;

  // if clicked is deleteButton or img within deleteButton
  if (
    e.target.id === 'delete-item--js' ||
    e.target.parentNode.id === 'delete-item--js'
  )
    return null;

  // no longer need to check
  // if parentNode is the container div
  if (parentNode.id === 'item--js') return null;
  // timeStampEl = getTimeStampEl(parentNode.children);

  // if parentNode is label
  if (parentNode.parentNode.id === 'item--js')
    timeStampEl = getTimeStampEl(parentNode.parentNode.children);

  timeStampEl.textContent = `Time Last Taken: ${getTodaysDateString()} `;
}

function getTimeStampEl(childrenArr) {
  return Array.from(childrenArr).filter((el) =>
    Array.from(el.classList).includes('timestamp')
  )[0];
}

function getTodaysDateString() {
  const date = new Date();

  return new Intl.DateTimeFormat('default', {
    dateStyle: 'full',
    timeStyle: 'short',
  }).format(date);
}

function createLogItemEl(itemName) {
  /*
  <div class="item-container" id="item--js">
          <label>
            Creatine Taken?
            <input type="checkbox" name="taken" /
          </label>
          <p class="timestamp">Time Last Taken:</p>
        </div>
  
  
  */

  const div = document.createElement('div');
  const label = document.createElement('label');
  const input = document.createElement('input');
  const p = document.createElement('p');

  // container
  div.classList.add('item-container');
  div.id = 'item--js';

  // label
  label.textContent = itemName;

  // input
  input.type = 'checkbox';
  input.name = 'taken';
  input.id = 'completed-checkbox--js';
  label.htmlFor = '';

  // build label
  label.insertAdjacentElement('beforeend', input);

  // p
  p.classList.add('timestamp');
  p.textContent = 'Time Last Taken:';

  //build div - fill from  bottom
  div.insertAdjacentElement('beforeend', label);
  div.insertAdjacentElement('beforeend', p);

  // attach event listener
  div.addEventListener('click', handleItemContainerClick);

  // check if delete button already exists
  const existingDeleteBtnEl = document.querySelector('#delete-item--js');
  if (existingDeleteBtnEl) {
    label.insertAdjacentElement('beforeend', createDeleteButtonEl());
  }

  return div;
}

function addDeleteBtnToAllListItems(nodeList) {
  const elementArr = Array.from(nodeList);

  elementArr.forEach((el) => {
    const childrenArray = Array.from(el.children);

    const existingDeleteBtn = childrenArray.find(
      (el) => el.id === 'delete-item--js'
    );

    // el here is the parent
    if (!existingDeleteBtn) {
      el.insertAdjacentElement('beforeend', createDeleteButtonEl());
    } else {
      existingDeleteBtn.remove();
    }
  });
}

function createDeleteButtonEl() {
  const button = document.createElement('button');
  const img = document.createElement('img');

  // button
  button.classList.add('button-23');
  button.classList.add('delete-btn');
  button.id = 'delete-item--js';
  button.type = 'button';

  // add eventlistener
  button.addEventListener('click', setToDelete);

  // img
  img.src = '/assets/x.svg';
  img.alt = 'delete item';

  // build button
  button.insertAdjacentElement('afterbegin', img);

  return button;
  /*
  <button class="button-23 delete-btn" id="delete-item--js">
                <img src="/assets/x.svg" alt="delete item" />
              </button>
  
  */
}

async function submitNewItemToDB(item) {
  try {
    const rawResponse = await fetch('/newLog', {
      method: 'post',
      body: JSON.stringify({ item: item }),
      headers: { Accept: '*/*', 'Content-Type': 'application/json' },
    });

    const content = await rawResponse.json();

    console.log(content);
  } catch (err) {
    console.log('???????????? BANG BANG ERROR ????????????');
    console.error(err);
  }
}

function setToDelete(e) {
  console.log('click delete button');
  let parent;

  // if button then parentnode of label
  if (e.target.id === 'delete-item--js') parent = e.target.parentNode;

  // if img clicked then parentNode is btn and grandParent is label
  if (e.target.parentNode.id === 'delete-item--js')
    parent = e.target.parentNode.parentNode;

  parent.classList.toggle('delete-item');
}
