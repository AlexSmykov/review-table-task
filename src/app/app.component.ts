import { TuiRoot } from "@taiga-ui/core";
import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { JsonPipe } from '@angular/common';
import { 
  AbTableComponent,
  TableHeaderComponent,
  TableCellComponent,
  TableDefaultHeaderDirective,
  TableDefaultCellDirective,
  TableColumnCodeDirective,
  HeaderDataDirective,
  CellDataDirective,
  TableColumnConfig
} from './ab-table';
import { TuiDay, tuiDefaultSort } from "@taiga-ui/cdk";
import { TuiSortDirection } from "@taiga-ui/addon-table";

const TODAY = TuiDay.currentLocal();

function getAge(dob: TuiDay): number {
  const years = TODAY.year - dob.year;
  const months = TODAY.month - dob.month;
  const days = TODAY.day - dob.day;
  const offset = months > 0 || (!months && days > 9) ? 1 : 0;
  return years + offset;
}

// Интерфейс для демо данных
interface Person {
  id: number;
  name: string;
  dob: TuiDay;
  age: number;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    TuiRoot,
    AbTableComponent,
    TableHeaderComponent,
    TableCellComponent,
    TableDefaultHeaderDirective,
    TableDefaultCellDirective,
    TableColumnCodeDirective,
    HeaderDataDirective,
    CellDataDirective,
    JsonPipe
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'ScratchTable';

  // Конфигурация колонок
  columnConfig: TableColumnConfig[] = [
    {
      code: 'name',
      name: 'Имя',
      startSize: 100,
      sortable: true,
      resizable: true,
    },
    {
      code: 'dob',
      name: 'Дата рождения',
      sortable: false,
      resizable: true,
    },
    {
      code: 'age',
      name: 'Возраст',
      sortable: true,
      resizable: false,
    }
  ];

  // Демо данные - 20 записей с фиксированными именами
  demoData: Person[] = [
    { id: 1, name: 'Иванов Иван', dob: TuiDay.fromLocalNativeDate(new Date(1985, 5, 15)), age: 0 },
    { id: 2, name: 'Петров Петр', dob: TuiDay.fromLocalNativeDate(new Date(1990, 3, 10)), age: 0 },
    { id: 3, name: 'Сидоров Алексей', dob: TuiDay.fromLocalNativeDate(new Date(1978, 9, 22)), age: 0 },
    { id: 4, name: 'Смирнов Сергей', dob: TuiDay.fromLocalNativeDate(new Date(2000, 1, 5)), age: 0 },
    { id: 5, name: 'Кузнецов Михаил', dob: TuiDay.fromLocalNativeDate(new Date(1995, 7, 30)), age: 0 },
    { id: 6, name: 'Морозов Андрей', dob: TuiDay.fromLocalNativeDate(new Date(1982, 11, 12)), age: 0 },
    { id: 7, name: 'Волков Дмитрий', dob: TuiDay.fromLocalNativeDate(new Date(1975, 2, 18)), age: 0 },
    { id: 8, name: 'Лебедев Николай', dob: TuiDay.fromLocalNativeDate(new Date(1998, 4, 25)), age: 0 },
    { id: 9, name: 'Козлов Максим', dob: TuiDay.fromLocalNativeDate(new Date(1989, 8, 8)), age: 0 },
    { id: 10, name: 'Новиков Владимир', dob: TuiDay.fromLocalNativeDate(new Date(1979, 6, 1)), age: 0 },
    { id: 11, name: 'Соколов Артем', dob: TuiDay.fromLocalNativeDate(new Date(1992, 10, 15)), age: 0 },
    { id: 12, name: 'Попов Георгий', dob: TuiDay.fromLocalNativeDate(new Date(1987, 0, 20)), age: 0 },
    { id: 13, name: 'Лебедев Евгений', dob: TuiDay.fromLocalNativeDate(new Date(1973, 3, 7)), age: 0 },
    { id: 14, name: 'Козлов Виталий', dob: TuiDay.fromLocalNativeDate(new Date(2001, 5, 11)), age: 0 },
    { id: 15, name: 'Морозов Кирилл', dob: TuiDay.fromLocalNativeDate(new Date(1994, 8, 29)), age: 0 },
    { id: 16, name: 'Петров Вячеслав', dob: TuiDay.fromLocalNativeDate(new Date(1980, 4, 14)), age: 0 },
    { id: 17, name: 'Сидоров Игорь', dob: TuiDay.fromLocalNativeDate(new Date(1996, 2, 22)), age: 0 },
    { id: 18, name: 'Иванов Денис', dob: TuiDay.fromLocalNativeDate(new Date(1983, 7, 9)), age: 0 },
    { id: 19, name: 'Смирнов Олег', dob: TuiDay.fromLocalNativeDate(new Date(1977, 11, 3)), age: 0 },
    { id: 20, name: 'Кузнецов Роман', dob: TuiDay.fromLocalNativeDate(new Date(1999, 1, 27)), age: 0 }
  ];

  // Текущие отсортированные данные
  tableData: Person[] = [];
  
  // Текущая сортировка
  currentSortKey: string = 'name';
  currentSortDirection: TuiSortDirection = TuiSortDirection.Asc;

  totalItems = 0;

  ngOnInit(): void {
    // Вычисляем возраст для каждой записи
    this.demoData = this.demoData.map(person => ({
      ...person,
      age: getAge(person.dob)
    }))
    
    // Инициализируем таблицу
    this.sortData();
  }

  // Обработчик изменения сортировки
  onSortChange(event: {key: string, direction: number}): void {
    this.currentSortKey = event.key;
    this.currentSortDirection = event.direction as TuiSortDirection;
    this.sortData();
  }

  // Функция сортировки данных
  sortData(): void {
    // Создаем копию данных для сортировки
    this.tableData = [...this.demoData];
    
    // Сортируем данные в зависимости от выбранного столбца
    this.tableData.sort((a: Person, b: Person) => {
      // Определяем значения для сравнения в зависимости от ключа
      let valueA, valueB;
      
      if (this.currentSortKey === 'name') {
        valueA = a.name;
        valueB = b.name;
      } else if (this.currentSortKey === 'dob') {
        valueA = a.dob;
        valueB = b.dob;
      } else if (this.currentSortKey === 'age') {
        valueA = a.age;
        valueB = b.age;
      } else {
        // Если неизвестный ключ, возвращаем без сортировки
        return 0;
      }
      
      // Применяем стандартную функцию сортировки с учетом направления
      return this.currentSortDirection * tuiDefaultSort(valueA, valueB);
    });

    this.tableData = this.tableData
    
    // Обновляем общее количество записей
    this.totalItems = this.tableData.length;
  }

  // Обработчики событий страницы и изменения ширины колонки
  onPageChange(event: {page: number, size: number}): void {
    console.log('Изменение страницы:', event);

    // this.tableData = this.demoData.slice(event.page * event.size, (event.page + 1) * event.size);
  }

  onColumnWidthChange(event: {code: string, width: number}): void {
    console.log('Изменение ширины колонки:', event);
  }

  exampleTemplate = `
  <app-table 
      [columnConfig]="columnConfig"
      [data]="tableData"
      [totalItems]="totalItems"
      [tableName]="'users-table'"
      (pageChange)="onPageChange($event)"
      (sortChange)="onSortChange($event)"
      (columnWidthChange)="onColumnWidthChange($event)">
      <!-- Дефолтные шаблоны -->
      <ng-template appTableDefaultHeader let-data>
        <app-table-header [data]="data">
          {{ data }}
        </app-table-header>
      </ng-template>

      <ng-template appTableDefaultCell let-data>
        <app-table-cell [data]="data">
            {{ data }}
        </app-table-cell>
      </ng-template>
      
      <!-- Кастомный шаблон для колонки "name" -->
      <ng-container appTableColumnCode="name">
        <ng-template appHeaderData let-data>
          <app-table-header [data]="data">
            📋 {{ data }}
          </app-table-header>
        </ng-template>
        <ng-template appCellData let-data>
          <app-table-cell [data]="data">
            👤 {{ data }}
          </app-table-cell>
        </ng-template>
      </ng-container>

      <!-- Кастомный шаблон для колонки "age" -->
      <ng-container appTableColumnCode="age">
        <ng-template appCellData let-data>
          <app-table-cell [data]="data">
            🔢 {{ data }} лет
          </app-table-cell>
        </ng-template>
      </ng-container>
      
    </app-table>`
}
