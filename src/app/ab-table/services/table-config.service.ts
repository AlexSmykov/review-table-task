import { Injectable, InjectionToken } from '@angular/core';

export interface TableColumnConfig {
  code: string;
  name: string;
  startSize?: number;
  minSize?: number;
  maxSize?: number;
  sortable?: boolean;
  resizable?: boolean;
}

export interface TableConfigService {
  getColumnConfigs(): TableColumnConfig[];
  setColumnConfigs(configs: TableColumnConfig[]): void;
  saveColumnWidth(code: string, width: number): void;
  getColumns(): string[];
  setTableName(name: string): void;
  getTableName(): string;
}

export const TABLE_CONFIG_SERVICE = new InjectionToken<TableConfigService>('TABLE_CONFIG_SERVICE');

const STORAGE_KEY_PREFIX = 'table-columns-config';

@Injectable({
  providedIn: 'root'
})
export class DefaultTableConfigService implements TableConfigService {
  private columnsConfig: TableColumnConfig[] = [];
  private tableName: string = 'default';

  constructor() {}

  getTableName(): string {
    return this.tableName;
  }

  setTableName(name: string): void {
    this.tableName = name || 'default';
    this.loadFromStorage();
  }

  getColumnConfigs(): TableColumnConfig[] {
    return this.columnsConfig;
  }

  setColumnConfigs(configs: TableColumnConfig[]): void {
    this.columnsConfig = configs;
    this.saveToStorage();
  }

  saveColumnWidth(code: string, width: number): void {
    const columnIndex = this.columnsConfig.findIndex(column => column.code === code);
    
    if (columnIndex !== -1) {
      this.columnsConfig[columnIndex] = {
        ...this.columnsConfig[columnIndex],
        startSize: width
      };
      this.saveToStorage();
    }
  }

  getColumns(): string[] {
    return this.columnsConfig.map(column => column.code);
  }

  private getStorageKey(): string {
    return `${STORAGE_KEY_PREFIX}-${this.tableName}`;
  }

  private loadFromStorage(): void {
    try {
      const storedConfig = localStorage.getItem(this.getStorageKey());
      if (storedConfig) {
        this.columnsConfig = JSON.parse(storedConfig);
      }
    } catch (error) {
      console.error('Ошибка при загрузке конфигурации столбцов из localStorage:', error);
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(this.getStorageKey(), JSON.stringify(this.columnsConfig));
    } catch (error) {
      console.error('Ошибка при сохранении конфигурации столбцов в localStorage:', error);
    }
  }
} 