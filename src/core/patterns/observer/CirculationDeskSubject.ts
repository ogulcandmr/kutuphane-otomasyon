import { BookReturnEvent, IObserver, ISubject } from './IObserver';

export class CirculationDeskSubject implements ISubject<BookReturnEvent> {
  private observers: IObserver<BookReturnEvent>[] = [];

  public attach(observer: IObserver<BookReturnEvent>): void {
    if (!this.observers.includes(observer)) {
      this.observers.push(observer);
    }
  }

  public detach(observer: IObserver<BookReturnEvent>): void {
    const index = this.observers.indexOf(observer);
    if (index !== -1) {
      this.observers.splice(index, 1);
    }
  }

  public async notify(event: BookReturnEvent): Promise<void> {
    for (const observer of this.observers) {
      await observer.update(event);
    }
  }
}
