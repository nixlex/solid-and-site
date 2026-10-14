abstract class BuildingObject {
  protected name: string;
  protected address: string;
  private static objectCounter: number = 0;
  public readonly id: number;

  constructor(name: string, address: string) {
    this.name = name;
    this.address = address;
    BuildingObject.objectCounter++;
    this.id = BuildingObject.objectCounter;
  }

  abstract getType(): string;
  abstract calculateArea(): number;

  public getInfo(): string {
    return `[${this.getType()}] #${this.id} "${this.name}" по адресу: ${this.address}, площадь: ${this.calculateArea()} м²`;
  }

  public static getTotalObjects(): number {
    return BuildingObject.objectCounter;
  }
}

class Apartment extends BuildingObject {
  private floors: number;
  private unitsPerFloor: number;
  private unitArea: number;

  constructor(name: string, address: string, floors: number, unitsPerFloor: number, unitArea: number) {
    super(name, address);
    this.floors = floors;
    this.unitsPerFloor = unitsPerFloor;
    this.unitArea = unitArea;
  }

  getType(): string {
    return "Многоквартирный дом";
  }

  calculateArea(): number {
    return this.floors * this.unitsPerFloor * this.unitArea;
  }

  public getUnitsCount(): number {
    return this.floors * this.unitsPerFloor;
  }
}

class Cottage extends BuildingObject {
  private width: number;
  private length: number;
  private hasGarage: boolean;

  constructor(name: string, address: string, width: number, length: number, hasGarage: boolean) {
    super(name, address);
    this.width = width;
    this.length = length;
    this.hasGarage = hasGarage;
  }

  getType(): string {
    return "Коттедж";
  }

  calculateArea(): number {
    const garageArea = this.hasGarage ? 25 : 0;
    return this.width * this.length + garageArea;
  }
}

class Townhouse extends BuildingObject {
  private sections: number;
  private sectionArea: number;

  constructor(name: string, address: string, sections: number, sectionArea: number) {
    super(name, address);
    this.sections = sections;
    this.sectionArea = sectionArea;
  }

  getType(): string {
    return "Таунхаус";
  }

  calculateArea(): number {
    return this.sections * this.sectionArea;
  }
}

interface IContractor {
  name: string;
  license: string;
  getSpecialization(): string;
  getCostPerM2(): number;
}

class GeneralContractor implements IContractor {
  public name: string;
  public license: string;

  constructor(name: string, license: string) {
    this.name = name;
    this.license = license;
  }

  getSpecialization(): string {
    return "Общестроительные работы";
  }

  getCostPerM2(): number {
    return 85_000; // руб/м²
  }
}

class ElectricalContractor extends GeneralContractor {
  constructor(name: string, license: string) {
    super(name, license);
  }

  getSpecialization(): string {
    return "Электромонтажные работы";
  }

  getCostPerM2(): number {
    return 12_000;
  }
}

class PlumbingContractor extends GeneralContractor {
  constructor(name: string, license: string) {
    super(name, license);
  }

  getSpecialization(): string {
    return "Сантехнические работы";
  }

  getCostPerM2(): number {
    return 15_000;
  }
}

class Budget {
  private _total: number;
  private _spent: number = 0;
  private _transactions: { description: string; amount: number }[] = [];

  constructor(total: number) {
    if (total <= 0) throw new Error("Бюджет должен быть положительным");
    this._total = total;
  }

  get total(): number { return this._total; }
  get spent(): number { return this._spent; }
  get remaining(): number { return this._total - this._spent; }
  get utilizationPercent(): number {
    return Math.round((this._spent / this._total) * 100);
  }

  public spend(amount: number, description: string): void {
    if (amount <= 0) throw new Error("Сумма расхода должна быть положительной");
    if (amount > this.remaining) {
      throw new Error(`Недостаточно средств. Остаток: ${this.remaining.toLocaleString("ru")} руб.`);
    }
    this._spent += amount;
    this._transactions.push({ description, amount });
  }

  public getReport(): string {
    const lines = this._transactions.map(
      (t) => `  • ${t.description}: ${t.amount.toLocaleString("ru")} руб.`
    );
    return [
      `Бюджет: ${this._total.toLocaleString("ru")} руб.`,
      `Потрачено: ${this._spent.toLocaleString("ru")} руб. (${this.utilizationPercent}%)`,
      `Остаток: ${this.remaining.toLocaleString("ru")} руб.`,
      `Расходы:`,
      ...lines,
    ].join("\n");
  }
}

type ProjectStatus = "Планирование" | "В работе" | "Завершён" | "Заморожен";

class Project {
  private static projectCount = 0;
  public readonly projectId: number;
  private _status: ProjectStatus;
  private contractors: IContractor[] = [];

  public readonly building: BuildingObject;
  public readonly budget: Budget;
  public readonly projectName: string;

  constructor(projectName: string, building: BuildingObject, budgetAmount: number) {
    Project.projectCount++;
    this.projectId = Project.projectCount;
    this.projectName = projectName;
    this.building = building;
    this.budget = new Budget(budgetAmount);
    this._status = "Планирование";
  }

  get status(): ProjectStatus { return this._status; }

  public addContractor(contractor: IContractor): void {
    this.contractors.push(contractor);
    console.log(` Подрядчик "${contractor.name}" добавлен в проект "${this.projectName}"`);
  }

  public startProject(): void {
    if (this._status !== "Планирование") throw new Error("Проект уже начат или завершён");
    this._status = "В работе";
    console.log(` Проект "${this.projectName}" запущен!`);
  }

  public completeProject(): void {
    this._status = "Завершён";
    console.log(` Проект "${this.projectName}" завершён!`);
  }

  public freezeProject(): void {
    this._status = "Заморожен";
    console.log(`  Проект "${this.projectName}" заморожен.`);
  }

  // Полиморфизм: вызываем getCostPerM2() у разных подрядчиков
  public calculateContractorsCost(): number {
    const area = this.building.calculateArea();
    return this.contractors.reduce((sum, c) => sum + c.getCostPerM2() * area, 0);
  }

  public getSummary(): string {
    return [
      `═══════════════════════════════════════`,
      `Проект #${this.projectId}: ${this.projectName}`,
      `Статус: ${this._status}`,
      `Объект: ${this.building.getInfo()}`,
      `Подрядчики (${this.contractors.length}):`,
      ...this.contractors.map((c) => `  • ${c.name} — ${c.getSpecialization()} (${c.getCostPerM2().toLocaleString("ru")} руб/м²)`),
      `Расчётная стоимость работ: ${this.calculateContractorsCost().toLocaleString("ru")} руб.`,
      `─────────────────────────────────────`,
      this.budget.getReport(),
      `═══════════════════════════════════════`,
    ].join("\n");
  }
}

class ConstructionCompany {
  private readonly companyName: string;
  private projects: Project[] = [];

  constructor(companyName: string) {
    this.companyName = companyName;
  }

  public addProject(project: Project): void {
    this.projects.push(project);
  }

  public getActiveProjects(): Project[] {
    return this.projects.filter((p) => p.status === "В работе");
  }

  public getTotalArea(): number {
    return this.projects.reduce((sum, p) => sum + p.building.calculateArea(), 0);
  }

  public printAllProjects(): void {
    console.log(`\n🏗️  Компания: ${this.companyName}`);
    console.log(`Всего проектов: ${this.projects.length}, активных: ${this.getActiveProjects().length}`);
    console.log(`Суммарная площадь объектов: ${this.getTotalArea().toLocaleString("ru")} м²\n`);
    this.projects.forEach((p) => console.log(p.getSummary()));
  }
}

console.log("демка\n");

const apt = new Apartment("ЖК Радуга", "ул. Ленина, 10", 12, 4, 65);
const cottage = new Cottage("Коттедж Сосновый", "пос. Солнечный, 5", 12, 15, true);
const townhouse = new Townhouse("Таунхаус Берёза", "ул. Лесная, 22", 6, 120);

const builder = new GeneralContractor("СтройГрупп ООО", "СРО-77-001");
const electrician = new ElectricalContractor("ЭлектроМонтаж", "СРО-77-045");
const plumber = new PlumbingContractor("АкваСервис", "СРО-77-112");

const project1 = new Project("Радуга-2026", apt, 500_000_000);
const project2 = new Project("Сосновый коттедж", cottage, 12_000_000);

project1.addContractor(builder);
project1.addContractor(electrician);
project1.addContractor(plumber);
project2.addContractor(builder);

project1.budget.spend(120_000_000, "Фундаментные работы");
project1.budget.spend(80_000_000, "Возведение каркаса");
project1.budget.spend(45_000_000, "Кровельные работы");

project2.budget.spend(3_500_000, "Фундамент");
project2.budget.spend(2_100_000, "Стены и перекрытия");

project1.startProject();
project2.startProject();
project2.completeProject();

const company = new ConstructionCompany("ГлавСтрой");
company.addProject(project1);
company.addProject(project2);
company.printAllProjects();

console.log(`\nВсего создано объектов: ${BuildingObject.getTotalObjects()}`);

console.log("\n--- Тест защиты бюджета ---");
try {
  project2.budget.spend(999_999_999, "Сверхрасход");
} catch (e) {
  console.log(` Ошибка: ${(e as Error).message}`);
}
