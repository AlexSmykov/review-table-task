import {AsyncPipe, NgForOf, NgIf, NgTemplateOutlet} from '@angular/common';
import {ChangeDetectionStrategy, Component, ContentChild, ContentChildren, EventEmitter, Input, Output, QueryList, TemplateRef, AfterContentInit, OnInit, Inject, Optional, OnChanges, SimpleChanges} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import type {
    TuiComparator,
    TuiSortChange,
    TuiTablePaginationEvent,
} from '@taiga-ui/addon-table';
import {
    TuiSortDirection,
    TuiTable,
    TuiTablePagination,
} from '@taiga-ui/addon-table';
import {
    TuiDay,
    tuiDefaultSort,
    tuiIsFalsy,
    tuiIsPresent,
    TuiLet,
    tuiToInt,
} from '@taiga-ui/cdk';
import {
    TuiLoader,
} from '@taiga-ui/core';
import type {Observable} from 'rxjs';
import {
    BehaviorSubject,
    combineLatest,
    debounceTime,
    filter,
    map,
    share,
    startWith,
    switchMap,
    timer,
    of,
} from 'rxjs';
import { TableHeaderComponent } from './table-header/table-header.component';
import { TableCellComponent } from './table-cell/table-cell.component';
import { 
    TableDefaultHeaderDirective, 
    TableDefaultCellDirective, 
    TableColumnCodeDirective, 
    HeaderDataDirective, 
    CellDataDirective,
} from './directives';
import { TABLE_CONFIG_SERVICE, TableConfigService, TableColumnConfig, DefaultTableConfigService } from './services/table-config.service';

@Component({
    standalone: true,
    selector: 'app-table',
    imports: [
        AsyncPipe,
        FormsModule,
        NgForOf,
        NgIf,
        NgTemplateOutlet,
        ReactiveFormsModule,
        TuiLet,
        TuiLoader,
        TuiTable,
        TuiTablePagination,
    ],
    templateUrl: './app-table.component.html',
    styleUrls: ['./app-table.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {
            provide: TABLE_CONFIG_SERVICE,
            useClass: DefaultTableConfigService
        }
    ]
})
export class AbTableComponent implements AfterContentInit, OnInit, OnChanges {
    @Input() data: readonly any[] = [];
    @Input() totalItems = 0;
    @Input() pageSize = 10;
    @Input() columnConfig: TableColumnConfig[] = [];
    @Input() tableName: string = 'default';
    @Input() loading: boolean | null = null;

    @Output() pageChange = new EventEmitter<{page: number, size: number}>();
    @Output() sortChange = new EventEmitter<{key: string, direction: TuiSortDirection}>();
    @Output() columnWidthChange = new EventEmitter<{code: string, width: number}>();

    @ContentChild(TableDefaultHeaderDirective) defaultHeaderTemplate?: TableDefaultHeaderDirective;
    @ContentChild(TableDefaultCellDirective) defaultCellTemplate?: TableDefaultCellDirective;
    @ContentChildren(TableColumnCodeDirective) columnTemplates?: QueryList<TableColumnCodeDirective>;

    protected readonly page$ = new BehaviorSubject(0);

    protected readonly direction$ = new BehaviorSubject<TuiSortDirection>(
        TuiSortDirection.Desc,
    );

    protected readonly sortKey$ = new BehaviorSubject<string>('name');
    protected readonly size$ = new BehaviorSubject(this.pageSize);
    
    private readonly loading$$ = new BehaviorSubject<boolean | null>(null);

    protected readonly request$ = combineLatest([
        this.sortKey$,
        this.direction$,
        this.page$,
        this.size$,
    ]).pipe(
        debounceTime(0),
        map(([key, direction, page, size]) => {
            this.pageChange.emit({page, size});
            this.sortChange.emit({key, direction});
            return true;
        }),
        share(),
    );

    protected columns: string[] = [];

    protected readonly loading$ = combineLatest([
        this.request$.pipe(map(tuiIsFalsy)),
        this.loading$$.pipe(startWith(this.loading))
    ]).pipe(
        map(([requestLoading, inputLoading]) => inputLoading !== null ? inputLoading : requestLoading)
    );


    protected readonly total$ = this.request$.pipe(
        filter(tuiIsPresent),
        map(() => this.totalItems),
        startWith(0),
    );

    protected readonly data$: Observable<readonly any[]> = this.request$.pipe(
        filter(tuiIsPresent),
        map(_ => this.data.slice(this.page$.value * this.size$.value, (this.page$.value + 1) * this.size$.value)),
        startWith([]),
    );

    constructor(
        @Inject(TABLE_CONFIG_SERVICE) private readonly configService: TableConfigService
    ) {}

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['pageSize'] && !changes['pageSize'].firstChange) {
            this.size$.next(this.pageSize);
        }
        
        if (changes['loading'] && !changes['loading'].firstChange) {
            this.loading$$.next(this.loading);
        }
    }

    ngOnInit(): void {
        this.configService.setTableName(this.tableName);
        
        if (this.columnConfig.length > 0) {
            this.configService.setColumnConfigs(this.columnConfig);
            this.columns = this.columnConfig.map(column => column.code);
        } else {
            this.columns = this.configService.getColumns();
        }
        
        this.size$.next(this.pageSize);
        
        if (this.loading !== null) {
            this.loading$$.next(this.loading);
        }
    }
    
    @Input()
    set isLoading(value: boolean | null) {
        this.loading$$.next(value);
    }

    protected onPagination({page, size}: TuiTablePaginationEvent): void {
        this.page$.next(page);
        this.size$.next(size);
        this.pageChange.emit({page, size});
    }

    protected change({sortKey, sortDirection}: TuiSortChange<any>): void {
        if (sortKey && typeof sortKey === 'string') {
            this.sortKey$.next(sortKey);
            this.direction$.next(sortDirection);
            this.sortChange.emit({key: sortKey, direction: sortDirection});
        }
    }

    protected getColumnTemplate(columnCode: string): TableColumnCodeDirective | undefined {
        return this.columnTemplates?.find(template => template.columnCode === columnCode);
    }

    protected hasCustomHeaderTemplate(columnCode: string): boolean {
        return !!this.getColumnTemplate(columnCode)?.headerTemplate;
    }

    protected hasCustomCellTemplate(columnCode: string): boolean {
        return !!this.getColumnTemplate(columnCode)?.cellTemplate;
    }

    protected getColumnConfig(columnCode: string): TableColumnConfig | undefined {
        return this.configService.getColumnConfigs().find(config => config.code === columnCode);
    }

    protected isColumnSortable(columnCode: string): boolean {
        const config = this.getColumnConfig(columnCode);
        return config?.sortable ?? false;
    }

    protected isColumnResizable(columnCode: string): boolean {
        const config = this.getColumnConfig(columnCode);
        return config?.resizable ?? false;
    }

    protected getColumnStartSize(columnCode: string): number | undefined {
        const config = this.getColumnConfig(columnCode);
        return config?.startSize;
    }

    protected getColumnMinSize(columnCode: string): number | undefined {
        const config = this.getColumnConfig(columnCode);
        return config?.minSize;
    }

    protected getColumnMaxSize(columnCode: string): number | undefined {
        const config = this.getColumnConfig(columnCode);
        return config?.maxSize;
    }

    protected getColumnName(columnCode: string): string {
        const config = this.getColumnConfig(columnCode);
        return config?.name || columnCode;
    }

    ngAfterContentInit(): void {
        if (!this.defaultHeaderTemplate || !this.defaultCellTemplate) {
            console.error('Не предоставлены дефолтные шаблоны для отображения заголовков и ячеек таблицы');
        }
    }

    protected getHeaderTemplate(columnCode: string): TemplateRef<any> | undefined {
        const customTemplate = this.getColumnTemplate(columnCode)?.headerTemplate?.templateRef;
        if (customTemplate) {
            return customTemplate;
        }
        if (!this.defaultHeaderTemplate?.templateRef) {
            console.error(`Не найден дефолтный шаблон заголовка для столбца ${columnCode}`);
        }
        return this.defaultHeaderTemplate?.templateRef;
    }

    protected getCellTemplate(columnCode: string): TemplateRef<any> | undefined {
        const customTemplate = this.getColumnTemplate(columnCode)?.cellTemplate?.templateRef;
        if (customTemplate) {
            return customTemplate;
        }
        if (!this.defaultCellTemplate?.templateRef) {
            console.error(`Не найден дефолтный шаблон ячейки для столбца ${columnCode}`);
        }
        return this.defaultCellTemplate?.templateRef;
    }

    onColumnWidthChange(columnCode: string, event: any): void {
        console.log('onColumnWidthChange вызван для', columnCode, event);
        this.configService.saveColumnWidth(columnCode, event);
        this.columnWidthChange.emit({ code: columnCode, width: event });
    }
}
