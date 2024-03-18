//define task and next id, get values from local storage
let taskList = JSON.parse(localStorage.getItem("tasks"));
let nextId = JSON.parse(localStorage.getItem("nextId"));

function generateTaskId() {
  if (nextId === null) {
    nextId = 1;
  } else {
    nextId++;
  }

  localStorage.setItem("nextId", JSON.stringify(nextId));
  return nextId;
}

function createTaskCard(task) {
  //create a div with class and attr
  const taskCard = $("<div>")
    .addClass("card w-75 task-card draggable my-3")
    .attr("data-task-id", task.id);
  //create card features - Header, Body, Description, DueDate, DeleteBtn
  const cardHeader = $("<div>").addClass("card-header h4").text(task.title);
  const cardBody = $("<div>").addClass("card-body");
  const cardDescription = $("<p>").addClass("card-text").text(task.description);
  const cardDueDate = $("<p>").addClass("card-text").text(task.dueDate);
  const cardDeleteBtn = $("<button>")
    .addClass("btn btn-danger delete")
    .text("Delete")
    .attr("data-task-id", task.id);
  //when the delete button is clicked call handleDeleteTask function
  cardDeleteBtn.on("click", handleDeleteTask);

  //if task due date is true and task status is not equal to done
  if (task.dueDate && task.status !== "done") {
    //returns a fresh Day.js object with the current date and time.
    const now = dayjs();
    //define taskDueData and display month calander with DD/MM/YYYY
    const taskDueDate = dayjs(task.dueDate, "DD/MM/YYYY");

    //determine if the card should have background-color red, yellow, or white
    if (now.isSame(taskDueDate, "day")) {
      taskCard.addClass("bg-warning text-white");
    } else if (now.isAfter(taskDueDate)) {
      taskCard.addClass("bg-danger text-white");
      cardDeleteBtn.addClass("border-light");
    }
  }

  //append the description, due datem and delete button to card body
  cardBody.append(cardDescription, cardDueDate, cardDeleteBtn);
  //append the header and card body to the task card div
  taskCard.append(cardHeader, cardBody);
  //return the created card
  return taskCard;
}

function renderTaskList() {
  //if there is no value in task list, then task list is an empty array
  if (!taskList) {
    taskList = [];
  }

  //define todoList from the div with id = "todo-cards"
  const todoList = $("#todo-cards");
  //remove all child nodes and content from the selected elements.
  todoList.empty();

  //define inProgressList from the div with id = "in-progress-cards"
  const inProgressList = $("#in-progress-cards");
  //remove all child nodes and content from the selected elements.
  inProgressList.empty();

  //define doneList from the div with id = "done-cards"
  const doneList = $("#done-cards");
  //remove all child nodes and content from the selected elements.
  doneList.empty();

  //for each task in the task list
  for (let task of taskList) {
    //If status is equal to "to-do", create card and append to todo column
    if (task.status === "to-do") {
      todoList.append(createTaskCard(task));
    }
    //If status is equal to "in-progress", append to inProgressList column
    else if (task.status === "in-progress") {
      inProgressList.append(createTaskCard(task));
    }
    //If status is equal to "done", append to doneList column
    else if (task.status === "done") {
      doneList.append(createTaskCard(task));
    }
  }

  //enable draggable functionality to draggable class
  $(".draggable").draggable({
    opacity: 0.7,
    zIndex: 100,

    helper: function (e) {
      const original = $(e.target).hasClass("ui-draggable")
        ? $(e.target)
        : $(e.target).closest(".ui-draggable");
      return original.clone().css({
        maxWidth: original.outerWidth(),
      });
    },
  });
}

function handleAddTask(event) {
  //prevent the form from refreshing
  event.preventDefault();

  //create object with following keys
  //by default status is popluated with "to-do"
  const task = {
    id: generateTaskId(),
    title: $("#taskTitle").val(),
    description: $("#taskDescription").val(),
    dueDate: $("#taskDueDate").val(),
    status: "to-do",
  };
  //populate the task list with the task object
  taskList.push(task);
  //take the pushed data and place in local storage as a JSON object
  localStorage.setItem("tasks", JSON.stringify(taskList));
  //call renderTaskList function
  renderTaskList();
  //grab input value of taskTitle, taskDescription, and taskDueDate
  $("#taskTitle").val("");
  $("#taskDescription").val("");
  $("#taskDueDate").val("");
}

function handleDeleteTask(event) {
  //prevent default settings
  event.preventDefault();
  //create variable whos value will be id of card user wants to delete
  const taskId = $(this).attr("data-task-id");
  //filter out any task whos id matches the task id variable
  taskList = taskList.filter((task) => task.id !== parseInt(taskId));
  localStorage.setItem("tasks", JSON.stringify(taskList));
  renderTaskList();
}

function handleDrop(event, ui) {
  const taskId = ui.draggable[0].dataset.taskId;
  const newStatus = event.target.id;
  //Update the status for each drop event
  for (let task of taskList) {
    if (task.id === parseInt(taskId)) {
      task.status = newStatus;
    }
  }
  //update the status in local storage
  localStorage.setItem("tasks", JSON.stringify(taskList));
  renderTaskList();
}

$(document).ready(function () {
  //call function renderTaskList(),
  renderTaskList();

  //when the submit button has been pushed, call fundtion handleAddTask
  $("#taskForm").on("submit", handleAddTask);
  //for each lane, accept draggable and drop handleDrop
  $(".lane").droppable({
    accept: ".draggable",
    drop: handleDrop,
  });
  //apply date picker to taskDueDate container
  $("#taskDueDate").datepicker({
    changeMonth: true,
    changeYear: true,
  });
});
