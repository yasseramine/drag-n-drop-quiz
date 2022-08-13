const quizContainer = document.getElementById('drag-n-drop-quiz');
quizContainer.classList.add('drag-n-drop-quiz');

function createElement(tag, className, id) {
  const el = document.createElement(tag);
  el.setAttribute('class', className);
  el.setAttribute('id', id);
  return el;
}

// vars
let draggingItem;
let questionId;

questions.forEach((question, index) => {
  const QUESTION_ID = `q${index}`;
  const questionEl = createElement('div', 'question', QUESTION_ID);
  quizContainer.append(questionEl);

  // add title for question
  const titleEl = createElement('h3', 'title', '');
  titleEl.innerHTML = question[0];
  questionEl.append(titleEl);

  // add drag and drops div to question
  const dragsEl = createElement('div', 'drags', '');
  const dropsEl = createElement('div', 'drops', '');
  questionEl.append(dragsEl);
  questionEl.append(dropsEl);

  // add drag items
  drags = question
    .filter((choice, index) => index !== 0)
    .sort((a, b) => a.dragOrder - b.dragOrder);

  drags.forEach((drag) => {
    const dragEl = createElement('div', 'drag', '');
    const item = createElement('div', 'item', QUESTION_ID);
    item.draggable = true;
    item.innerHTML = drag.text;

    dragEl.append(item);
    dragsEl.append(dragEl);

    const dropEl = createElement('div', 'drop', '');
    dropsEl.append(dropEl);

    // drag n drop event listeners
    item.addEventListener('dragstart', dragStart);
    item.addEventListener('dragend', dragEnd);

    dropEl.addEventListener('dragover', dragOver);
    dropEl.addEventListener('dragleave', dragLeave);
    dropEl.addEventListener('drop', drop);

    dragEl.addEventListener('dragover', dragOver);
    dragEl.addEventListener('dragleave', dragLeave);
    dragEl.addEventListener('drop', drop);
  });

  // add checkanswers and reset btns
  const btns = createElement('div', 'btns', '');
  const checkBtn = createElement('button', 'check-answers', '');
  checkBtn.dataset.questionId = QUESTION_ID;
  checkBtn.innerHTML = 'Check Answers';

  btns.append(checkBtn);

  // click event listener for btns
  checkBtn.addEventListener('click', checkAnswers);

  questionEl.append(btns);
});

// drag n drop functions
function dragStart(e) {
  // save question id
  questionId = e.target.id;

  // save dragging item
  draggingItem = e.target;

  if (hasClassName(draggingItem.parentNode, 'drag')) {
    draggingItem.parentNode.classList.add('leaving-drag');
    draggingItem.parentNode.classList.remove('entering-drag');
  }
  if (hasClassName(draggingItem.parentNode, 'drop')) {
    draggingItem.parentNode.classList.add('leaving-drop');
    draggingItem.parentNode.classList.remove('entering-drop');
  }

  // reset exercise on drag start
  const dropsEl = e.target.parentNode.parentNode.parentNode.querySelector('.drops');
  dropsEl.childNodes.forEach((dropEl) => {
    dropEl.classList.remove('correct');
    dropEl.classList.remove('incorrect');
  });
}

function dragOver(e) {
  // get question id
  const DRAG_FROM_QUESTION_ID = questionId;
  const DRAG_TO_QUESTION_ID = e.target.parentNode.parentNode.id;

  // if the user is trying to move a choice to an external question > exit
  // if drop element has already some children > exit
  if (DRAG_FROM_QUESTION_ID !== DRAG_TO_QUESTION_ID || e.target.hasChildNodes()) return;
  e.preventDefault();

  if (hasClassName(e.target, 'drag')) {
    e.target.classList.add('entering-drag');
  }

  if (hasClassName(e.target, 'drop')) {
    e.target.classList.add('entering-drop');
  }
}
function dragLeave(e) {
  if (e.target.nodeName === '#text' || e.target.className === 'item') return;

  if (hasClassName(e.target, 'drop')) {
    e.target.classList.remove('entering-drop');
  }
  if (hasClassName(e.target, 'drag')) {
    e.target.classList.remove('entering-drag');
  }
}
function dragEnd(e) {
  if (e.target.parentNode === null) return;
  if (e.dataTransfer.getData('drag-source') === 'drag') {
    if (hasClassName(e.target.parentNode, 'drag')) {
      e.target.parentNode.classList.remove('leaving-drag');
    }
  }
}
function drop(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'copy';

  const draggingItemClone = draggingItem.cloneNode(true);
  draggingItemClone.addEventListener('dragstart', dragStart);
  draggingItemClone.addEventListener('dragend', dragEnd);

  e.target.append(draggingItemClone);

  // new drop element
  if (hasClassName(e.target, 'drop')) {
    e.target.classList.add('dropped');
  }

  // old drop element
  if (hasClassName(draggingItem.parentNode, 'drop')) {
    draggingItem.parentNode.classList.remove('dropped');
  }

  draggingItem.parentNode.removeChild(draggingItem);
}

// check answers function
function checkAnswers(e) {
  const checkBtn = e.target;
  // question id is string: 'q+number'
  const questionId = checkBtn.dataset.questionId;
  const questionIndex = +checkBtn.dataset.questionId.substring(1);

  // drops with correct order
  const drops = questions[questionIndex]
    .filter((drop, index) => index !== 0)
    .sort((a, b) => a.dropOrder - b.dropOrder);

  // drops element
  const dropsEl = document.querySelector(`#${questionId} .drops`);
  const dropEls = [...dropsEl.childNodes];

  drops.forEach((drop, index) => {
    // reset correct and incorrect css
    dropEls[index].classList.remove('correct');
    dropEls[index].classList.remove('incorrect');

    // check for correct and correct answers
    if (drop.text === dropEls[index].textContent) {
      dropEls[index].classList.add('correct');
    } else {
      dropEls[index].classList.add('incorrect');
    }
  });
}

// utils
function hasClassName(element, className) {
  return [...element.classList].some(
    (elementClassName) => elementClassName === className
  );
}
