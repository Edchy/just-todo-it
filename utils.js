// import { todosArray, deletedTodos } from "./Todo.js";
import {
  todoList,
  form,
  todosArray,
  deletedTodos,
  deletedTodoSection,
  markAllBtn,
  markAllBtnCompleteText,
} from "./main.js";

// konfetti-bibliotek
import JSConfetti from "js-confetti";
const jsConfetti = new JSConfetti();
export function confettiYeahBabyYeah() {
  const jsConfettiOptions = {
    confettiColors: [
      "#ff0a54",
      "#ff477e",
      "#ff7096",
      "#ff85a1",
      "#fbb1bd",
      "#f9bec7",
    ],
  };
  jsConfetti.addConfetti(jsConfettiOptions);
}

// utility function för att hämta saker från ls och parsa, returnerar det som skickas in som en andra variabel om LS är tomt.
export function getItemFromLS(item, initial) {
  const storedItem = localStorage.getItem(item);
  if (storedItem) {
    return JSON.parse(storedItem);
  }
  return initial;
}
// spara stringifierat objet till LS - namn i LS + det som ska sparas
export function saveToLS(item, obj) {
  localStorage.setItem(item, JSON.stringify(obj));
}

// datumformaterare
export const dateFormatter = new Intl.DateTimeFormat("sv-SE", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

// hitta index i array
export function findIndexById(arr, el) {
  return arr.findIndex((item) => item.id === Number(el.getAttribute("id")));
}

// uppdatera och rendera lista med borttagna todos (kanske inte optimalt att cleara innerHTML varje gång)
function updateAndRenderDeletedTodos(element) {
  deletedTodos.push(element.querySelector(".todo-title").innerText);
  deletedTodoSection.innerHTML = "";
  deletedTodos.forEach((todoTitle) => {
    const li = document.createElement("li");
    li.textContent = todoTitle;
    // få värdet till textrutan vid klick
    li.addEventListener("click", () => {
      form.querySelector("input[type='text']").value = li.textContent;
    });
    deletedTodoSection.append(li);
  });
}

// ta bort - kolla om delete-knappen trycks - hämta närmaste li, lägg till klass för transition, ta bort från array, spara LS, anropa ovanstående funktion, efter 750ms (tid för transition) ta bort från DOM.
export function removeTodo(e) {
  if (e.target.matches("button")) {
    const li = e.target.closest("li.todo-item");
    if (li) {
      li.classList.add("removing");
      const indexOfItemToDelete = findIndexById(todosArray, li);
      //ta bort från DOM och lista
      todosArray.splice(indexOfItemToDelete, 1);
      saveToLS("todos", todosArray);
      updateAndRenderDeletedTodos(li);

      setTimeout(() => {
        li.remove();
      }, 750);
    }
  }
}

// radera allt - om confirm===true nollställ innerHTML och array
export function removeAllTodos() {
  if (todoList.children.length === 0) return; // tidig return om listan är tom
  if (
    !confirm(
      "This will give you time to do the shit you love instead of boring chores"
    )
  )
    return;
  todoList.innerHTML = "";
  // deletedTodos.push(...todosArray);
  // deletedTodos.forEach((todo) => {
  //   const li = document.createElement("li");
  //   li.textContent = todo.task;
  //   deletedTodoSection.append(li);
  // });

  todosArray.length = 0;

  markAllBtn.textContent = markAllBtnCompleteText;
  saveToLS("todos", todosArray);
}

// ta bort färdiga
export function removeCompletedTodos() {
  if (!confirm("Oh yeah?")) return;
  const filteredTodos = todosArray.filter((todo) => !todo.completed);
  todoList.querySelectorAll(".todo-item").forEach((todo) => {
    if (todo.classList.contains("completed")) todo.remove();
  });
  todosArray.length = 0;
  todosArray.push(...filteredTodos);
  saveToLS("todos", todosArray);
}
