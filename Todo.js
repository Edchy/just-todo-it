export default class Todo {
  // prop som tillhör klassen, kommer inte finnas på instanser
  static nextId = 1;

  constructor(task, prio) {
    this.id = Todo.nextId++;
    this.task = task;
    this.prio = prio;
    this.completed = false;
  }
}
