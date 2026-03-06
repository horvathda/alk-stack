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
    savingIds: string[];
    deletingIds: string[];
}

@Injectable({
    providedIn: 'root'
})
export class TaskStore {
    private state$ = new BehaviorSubject<TaskState>({
        items: [],
        total: 0,
        page: 1,
        pageSize: 30,
        loading: false,
        error: null,
        savingIds: [],
        deletingIds: []
    });

    readonly vm$: Observable<TaskState> = this.state$.asObservable();

    constructor(private api: TaskApi) { }

    private get s() {
        return this.state$.value;
    }

    private addSaving(id: string) {
        if (this.s.savingIds.includes(id)) return;
        this.state$.next({
            ...this.s,
            savingIds: [...this.s.savingIds, id]
        });
    }

    private removeSaving(id: string) {
        this.state$.next({
            ...this.s,
            savingIds: this.s.savingIds.filter(x => x !== id)
        });
    }

    private addDeleting(id: string) {
        if (this.s.deletingIds.includes(id)) return;
        this.state$.next({
            ...this.s,
            deletingIds: [...this.s.deletingIds, id]
        });
    }

    private removeDeleting(id: string) {
        this.state$.next({
            ...this.s,
            deletingIds: this.s.deletingIds.filter(x => x !== id)
        });
    }

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
        const previousItems = this.s.items;
        const newItems = this.s.items.map(item =>
            item.id === id ? { ...item, title, description, completed } : item
        );

        this.state$.next({
            ...this.s,
            items: newItems,
            error: null
        });

        this.addSaving(id);

        this.api.updateTask(id, { title, description, completed }).subscribe({
            next: () => {
                this.removeSaving(id);
            },
            error: (err) => {
                this.state$.next({
                    ...this.s,
                    items: previousItems,
                    error: err?.message ?? 'Update failed'
                });
                this.removeSaving(id);
            }
        });
    }

    delete(id: string) {
        this.addDeleting(id);

        this.api.deleteTask(id).subscribe({
            next: () => {
                const current = this.s;
                const nextItems = current.items.filter(x => x.id !== id);
                const nextTotal = Math.max(0, current.total - 1);

                let nextPage = current.page;
                const isLastOnPage = current.items.length === 1;

                if (current.page > 1 && isLastOnPage) {
                    nextPage = current.page - 1;
                }

                this.state$.next({
                    ...current,
                    items: nextItems,
                    total: nextTotal,
                    page: nextPage,
                    error: null,
                    deletingIds: current.deletingIds.filter(x => x !== id)
                });

                if (nextPage !== current.page) {
                    this.refresh();
                }
            },
            error: (err) => {
                this.state$.next({
                    ...this.s,
                    error: err?.message ?? 'Delete failed'
                });
                this.removeDeleting(id);
            }
        });
    }
}