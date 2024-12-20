import "./style.css";
import Todo from "./Todo.js";
import {
  findIndexById,
  removeTodo,
  removeAllTodos,
  removeCompletedTodos,
  dateFormatter,
  confettiYeahBabyYeah,
  getItemFromLS,
  saveToLS,
} from "./utils.js";

// för att kolla om mobil - används i submitlyssnaren för att avgöra om input ska få focus efter varje submit eller inte.
const isMobile =
  window.matchMedia("(max-width: 768px)").matches && "ontouchstart" in window;

// hämta från LS - om inte finns skapa en inital array
export const todosArray = getItemFromLS("todos", [
  new Todo("äta", ""),
  new Todo("jobba", ""),
  new Todo("sova", ""),
  new Todo("dö", ""),
]);
export const deletedTodos = [];
export const deletedTodoSection = document.querySelector(".deleted-todos");
export const todoList = document.querySelector(".todo-list");
export const markAllBtn = document.querySelector(".mark-all-btn");
export const markAllBtnCompleteText = "mark all complete";
const markAllBtnIncompleteText = "mark all incomplete";
const removeAllBtn = document.querySelector(".remove-all-btn");
const removeCompletedBtn = document.querySelector(".remove-complete-btn");
export const form = document.querySelector("form");
const selectFilter = document.querySelector("#filter");
const radioButtons = document.querySelectorAll('input[type="radio"]');
const ranger = document.querySelector('input[type="range"]');

// färgtema från LS
const lch = getItemFromLS("theme", {
  lightness: 70,
  chroma: 0.31,
  hue: 280,
});

ranger.value = lch.lightness;

// sätt custom property till värdena från LS
document.documentElement.style.setProperty(
  "--primary-color",
  `oklch(${lch.lightness}% ${lch.chroma} ${lch.hue})`
);

// ändra värde för lightness baserat på range input
ranger.addEventListener("change", () => {
  lch.lightness = ranger.value;
  document.documentElement.style.setProperty(
    "--primary-color",
    `oklch(${lch.lightness}% ${lch.chroma} ${lch.hue})`
  );
  saveToLS("theme", lch); // spara det nya värdet till LS
});

// refaktorera detta att bli mer DRY, otroligt mycket upprepning
radioButtons.forEach((radio) => {
  radio.addEventListener("change", (e) => {
    if (e.target.value === "purple") {
      lch.hue = 280;
      document.documentElement.style.setProperty(
        "--primary-color",
        `oklch(${lch.lightness}% 0.31 ${lch.hue})`
      );
      saveToLS("theme", lch);
    }
    if (e.target.value === "blue") {
      lch.hue = 260;
      document.documentElement.style.setProperty(
        "--primary-color",
        `oklch(${lch.lightness}% 0.31 ${lch.hue})`
      );
      saveToLS("theme", lch);
    }
    if (e.target.value === "green") {
      lch.hue = 520;
      document.documentElement.style.setProperty(
        "--primary-color",
        `oklch(${lch.lightness}% 0.31 ${lch.hue})`
      );
      saveToLS("theme", lch);
    }
    if (e.target.value === "red") {
      lch.hue = 20;
      document.documentElement.style.setProperty(
        "--primary-color",
        `oklch(${lch.lightness}% 0.31 ${lch.hue})`
      );
      saveToLS("theme", lch);
    }
    if (e.target.value === "orange") {
      lch.hue = 73;
      document.documentElement.style.setProperty(
        "--primary-color",
        `oklch(${lch.lightness}% 0.31 ${lch.hue})`
      );
      saveToLS("theme", lch);
    }
    if (e.target.value === "pink") {
      lch.hue = 333;
      document.documentElement.style.setProperty(
        "--primary-color",
        `oklch(${lch.lightness}% 0.31 ${lch.hue})`
      );
      saveToLS("theme", lch);
    }
  });
});
document.addEventListener("DOMContentLoaded", renderTodoList);
todoList.addEventListener("click", removeTodo);
removeAllBtn.addEventListener("click", removeAllTodos);
markAllBtn.addEventListener("click", markAllTodos);
removeCompletedBtn.addEventListener("click", removeCompletedTodos);

// Skapa nya todos med classen Todo, skicka in värdet för text och checkbox inputs - pusha till array - skapa ny li-mall via createTodo() - appenda till UL - spara i LS
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const textInput = form.querySelector("input[type='text']");
  if (textInput.value === "") return;
  const checkboxInput = form.querySelector("input[type='checkbox']");
  const prio = checkboxInput.checked;
  const newTodo = new Todo(textInput.value, prio);
  todosArray.push(newTodo);
  todoList.append(createTodo(newTodo));
  textInput.value = "";
  if (!isMobile) textInput.focus();
  checkboxInput.checked = false;
  saveToLS("todos", todosArray);
});

// lyssna efter filter-ändringar - toggla CSS-klasser för att applicera filterfunktionalitet
// här valde jag också att 'disabla' markAll-knappen pga massa bök :)
selectFilter.addEventListener("change", (e) => {
  let currentOption = e.target.value;
  const todos = todoList.querySelectorAll(".todo-item");
  let markAllBtnDisabled = true;
  switch (currentOption) {
    case "all":
      todos.forEach((todo) => todo.classList.remove("hidden"));
      markAllBtnDisabled = false;
      break;
    case "complete":
      todos.forEach((todo) => {
        if (!todo.classList.contains("completed")) {
          todo.classList.add("hidden");
        } else {
          todo.classList.remove("hidden");
        }
      });
      break;
    case "todo":
      todos.forEach((todo) => {
        if (todo.classList.contains("completed")) {
          todo.classList.add("hidden");
        } else {
          todo.classList.remove("hidden");
        }
      });
      break;
    case "prio":
      todos.forEach((todo) => {
        // children[1] farligt om struktur i HTML skulle ändras...fixa!
        if (
          !todo.children[1].classList.contains("prio") ||
          todo.classList.contains("completed")
        ) {
          todo.classList.add("hidden");
        } else {
          todo.classList.remove("hidden");
        }
      });
      break;
    default:
      console.log("FFFFFFFFFFFFFan");
  }
  if (markAllBtnDisabled) {
    markAllBtn.setAttribute("disabled", "");
  } else {
    markAllBtn.removeAttribute("disabled");
  }
});

// markera all todos som färdiga/ofärdiga - baserat på variabeln allTodosCompleted(true/false), lägg till klasser, ändra knapptext, skjut konfetti, spara
function markAllTodos() {
  const allTodos = todoList.querySelectorAll(".todo-item");
  const allTodosCompleted = todosArray.every((todo) => todo.completed === true);

  if (!allTodosCompleted) {
    allTodos.forEach((item) => item.classList.add("completed"));
    todosArray.forEach((todo) => (todo.completed = true));
    markAllBtn.textContent = markAllBtnIncompleteText;
    confettiYeahBabyYeah();
  } else {
    allTodos.forEach((item) => item.classList.remove("completed"));
    todosArray.forEach((todo) => (todo.completed = false));
    markAllBtn.textContent = markAllBtnCompleteText;
  }
  saveToLS("todos", todosArray);
}

// rendera lista
function renderTodoList() {
  todosArray.forEach((todo) => {
    todoList.append(createTodo(todo));
  });
}

// skapa todo, sätt attribut och innerHTML baserat på objektet som skickas in, returnerar en li - anropas vid submiteventet
function createTodo(todo) {
  const li = document.createElement("li");
  li.classList.add(`todo-item-${todo.id}`, "todo-item");
  li.setAttribute("id", `${todo.id}`);
  li.setAttribute("tabindex", "0");
  li.setAttribute("role", "button");
  li.setAttribute("aria-label", "toggle task complete");
  if (todo.completed) li.classList.add("completed");
  li.innerHTML = `
  <h3 class="todo-title">${todo.task}</h3>
  ${todo.prio ? "<div class='prio'>Prio</div>" : ""}
  <date class="date"><span>added:</span><br/> ${dateFormatter
    .format(new Date())
    .replace(",", " -")}</date>
  <button class="delete-btn"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
</svg>
</button>
  `;
  li.addEventListener("click", (e) => taskCompleted(e, todo, li));
  li.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      taskCompleted(e, todo, li);
    }
  });

  return li;
}

// markera enskild todo som färdig/inte färdig -
function taskCompleted(e, todo, li) {
  // kör bara om det inte är delete knappen som tryckts
  if (!e.target.matches(".delete-btn")) {
    todo.completed = !todo.completed;
    if (todo.completed) {
      li.classList.add("completed");
    } else {
      li.classList.remove("completed");
      markAllBtn.textContent = markAllBtnCompleteText;
    }

    const allTodosCompleted = todosArray.every(
      (todo) => todo.completed === true
    );

    // ändra knapptexten om alla är markerade som färdiga
    if (allTodosCompleted) {
      markAllBtn.textContent = markAllBtnIncompleteText;
      // skjut konfetti om allt är klart och om det inte är något annat filter
      if (selectFilter.value === "all") confettiYeahBabyYeah();
    }

    //uppdatera objektet i arrayen (jösses vad mycket manuella uppdateringar man behöver göra, svårt att hålla UI i sync med DATA)
    const indexOfItemToUpdate = findIndexById(todosArray, li);
    todosArray[indexOfItemToUpdate].completed = todo.completed;
    saveToLS("todos", todosArray);
  }
}
