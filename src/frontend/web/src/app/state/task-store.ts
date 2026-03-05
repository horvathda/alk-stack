import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { TaskApi, TaskItem } from '../services/task';

export interface TaskState {
    items: TaskItem[];
    total: number;
    page: number;
    pageSize: number;
    loading: boolean;
    error: string | null;
}

@Injectable({
    providedIn: 'root'
})
export class TaskStore {
    private state$ = new BehaviorSubject<TaskState>({
        items: [],
        total: 0,
        page: 1,
        pageSize: 5,
        loading: false,
        error: null
    });

    // olvasható stream a komponenseknek
    readonly vm$: Observable<TaskState> = this.state$.asObservable();

    constructor(private api: TaskApi) { }

    /** állapot pillanatnyi értéke (belsőhöz) */
    private get s() { return this.state$.value; }

    setPage(page: number) {
        this.state$.next({ ...this.s, page });
        this.refresh();
    }

    setPageSize(pageSize: number) {
        this.state$.next({ ...this.s, pageSize, page: 1 });
        this.refresh();
    }

    refresh() {
        this.state$.next({ ...this.s, loading: true, error: null });

        this.api.getTasks(this.s.page, this.s.pageSize)
            .pipe(finalize(() => this.state$.next({ ...this.s, loading: false })))
            .subscribe({
                next: (res) => {
                    this.state$.next({
                        ...this.s,
                        items: res.items ?? [],
                        total: res.total ?? 0,
                        page: res.page ?? this.s.page,
                        pageSize: res.pageSize ?? this.s.pageSize,
                        error: null
                    });
                },
                error: (err) => {
                    this.state$.next({
                        ...this.s,
                        items: [],
                        total: 0,
                        error: err?.message ?? 'Failed to load tasks'
                    });
                }
            });
    }

    /** CRUD akciók: mind refresh-el a végén */
    create(title: string, description: string | null) {
        this.state$.next({ ...this.s, loading: true, error: null });

        this.api.createTask({ title, description })
            .pipe(finalize(() => this.state$.next({ ...this.s, loading: false })))
            .subscribe({
                next: () => this.refresh(),
                error: (err) => this.state$.next({ ...this.s, error: err?.message ?? 'Create failed' })
            });
    }

    update(id: string, title: string, description: string | null, completed: boolean) {
        this.state$.next({ ...this.s, loading: true, error: null });

        this.api.updateTask(id, { title, description, completed })
            .pipe(finalize(() => this.state$.next({ ...this.s, loading: false })))
            .subscribe({
                next: () => this.refresh(),
                error: (err) => this.state$.next({ ...this.s, error: err?.message ?? 'Update failed' })
            });
    }

    delete(id: string) {
        this.state$.next({ ...this.s, loading: true, error: null });

        this.api.deleteTask(id)
            .pipe(finalize(() => this.state$.next({ ...this.s, loading: false })))
            .subscribe({
                next: () => {
                    // ha az utolsó elemet törölted az oldalon, lépj vissza 1 oldalt ha kell
                    const isLastOnPage = this.s.items.length === 1;
                    if (this.s.page > 1 && isLastOnPage) {
                        this.state$.next({ ...this.s, page: this.s.page - 1 });
                    }
                    this.refresh();
                },
                error: (err) => this.state$.next({ ...this.s, error: err?.message ?? 'Delete failed' })
            });
    }
}