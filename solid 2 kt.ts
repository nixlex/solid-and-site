class Project {
  constructor(
    public name: string,
    public area: number,
    public costPerM2: number
  ) {}
}

class CostCalculator {
  calculate(project: Project): number {
    return project.area * project.costPerM2;
  }
}

class ReportPrinter {
  print(project: Project, cost: number): void {
    console.log(`Проект: ${project.name}`);
    console.log(`Площадь: ${project.area} м², цена: ${project.costPerM2} руб/м²`);
    console.log(`Итого: ${cost.toLocaleString("ru")} руб.\n`);
  }
}

console.log("=== S: Single Responsibility ===");
const proj = new Project("ЖК Радуга", 5000, 85_000);
const calc = new CostCalculator();
const printer = new ReportPrinter();
printer.print(proj, calc.calculate(proj));

interface IDiscount {
  apply(price: number): number;
}

class NoDiscount implements IDiscount {
  apply(price: number): number { return price; }
}

class PercentDiscount implements IDiscount {
  constructor(private percent: number) {}
  apply(price: number): number { return price * (1 - this.percent / 100); }
}

class FixedDiscount implements IDiscount {
  constructor(private amount: number) {}
  apply(price: number): number { return Math.max(0, price - this.amount); }
}

class BudgetCalculator {
  constructor(private discount: IDiscount) {}

  calculate(basePrice: number): number {
    return this.discount.apply(basePrice);
  }
}

console.log("=== O: Open/Closed ===");
const base = 10_000_000;
console.log("Без скидки:    ", new BudgetCalculator(new NoDiscount()).calculate(base).toLocaleString("ru"));
console.log("Скидка 15%:    ", new BudgetCalculator(new PercentDiscount(15)).calculate(base).toLocaleString("ru"));
console.log("Скидка 500000: ", new BudgetCalculator(new FixedDiscount(500_000)).calculate(base).toLocaleString("ru"), "\n");

abstract class Building {
  abstract getType(): string;
  abstract calculateArea(): number;
  describe(): string {
    return `${this.getType()} — ${this.calculateArea()} м²`;
  }
}

class ApartmentBuilding extends Building {
  constructor(private floors: number, private unitsPerFloor: number, private unitArea: number) {
    super();
  }
  getType() { return "Многоквартирный дом"; }
  calculateArea(): number { return this.floors * this.unitsPerFloor * this.unitArea; }
}

class CottageBuilding extends Building {
  constructor(private width: number, private length: number) {
    super();
  }
  getType() { return "Коттедж"; }
  calculateArea(): number { return this.width * this.length; }
}

function printBuilding(b: Building): void {
  console.log(b.describe());
}

console.log("=== L: Liskov Substitution ===");
const buildings: Building[] = [
  new ApartmentBuilding(10, 4, 65),
  new CottageBuilding(12, 15),
];
buildings.forEach(printBuilding);
console.log();

interface IBuilder {
  build(objectName: string): void;
}

interface IDesigner {
  design(objectName: string): void;
}

interface IManager {
  manage(objectName: string): void;
}

class ConstructionWorker implements IBuilder {
  build(objectName: string): void {
    console.log(`Рабочий строит: ${objectName}`);
  }
}

class Architect implements IDesigner {
  design(objectName: string): void {
    console.log(`Архитектор проектирует: ${objectName}`);
  }
}

class Foreman implements IBuilder, IManager {
  build(objectName: string): void {
    console.log(`Прораб строит: ${objectName}`);
  }
  manage(objectName: string): void {
    console.log(`Прораб управляет проектом: ${objectName}`);
  }
}

console.log("=== I: Interface Segregation ===");
new ConstructionWorker().build("ЖК Солнечный");
new Architect().design("ЖК Солнечный");
new Foreman().build("ЖК Солнечный");
new Foreman().manage("ЖК Солнечный");
console.log();

interface INotifier {
  notify(message: string): void;
}

class EmailNotifier implements INotifier {
  notify(message: string): void {
    console.log(`[Email] ${message}`);
  }
}

class SmsNotifier implements INotifier {
  notify(message: string): void {
    console.log(`[SMS] ${message}`);
  }
}

class ProjectManager {
  constructor(private notifier: INotifier) {} 

  startProject(name: string): void {
    console.log(`Запуск проекта: ${name}`);
    this.notifier.notify(`Проект "${name}" запущен!`);
  }
}

console.log("=== D: Dependency Inversion ===");
const managerEmail = new ProjectManager(new EmailNotifier());
managerEmail.startProject("ЖК Берёзки");

const managerSms = new ProjectManager(new SmsNotifier());
managerSms.startProject("Коттеджный посёлок");
