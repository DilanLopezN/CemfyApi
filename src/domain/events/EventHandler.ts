import EventClass from 'node:events';

/**
 * @description Classe para lidar com eventos de forma facilitada
 * @author Dilan Lopez
 */
export class EventHandler {
  private eventService = new EventClass();
  private events: Set<string> = new Set();

  /**
   * @description Registra um evento e sua função associada
   * @param eventName Nome do evento
   * @param eventFunction Função acionada ao disparar o evento
   */
  create_event(
    eventName: string,
    eventFunction: (...args: any[]) => void,
  ): void {
    if (!this.events.has(eventName)) {
      this.events.add(eventName);
    }
    this.eventService.on(eventName, eventFunction);
  }

  /**
   * @description Dispara um evento previamente registrado
   * @param eventName Nome do evento a ser disparado
   * @param args Argumentos opcionais para o evento
   */
  dispatch_event(eventName: string, ...args: any[]): void {
    if (this.events.has(eventName)) {
      this.eventService.emit(eventName, ...args);
    } else {
      console.warn(`Evento "${eventName}" não registrado.`);
    }
  }

  /**
   * @description Remove um evento registrado
   * @param eventName Nome do evento a ser removido
   */
  remove_event(eventName: string): void {
    if (this.events.has(eventName)) {
      this.eventService.removeAllListeners(eventName);
      this.events.delete(eventName);
      console.log(`Evento "${eventName}" removido.`);
    } else {
      console.warn(`Evento "${eventName}" não encontrado.`);
    }
  }

  /**
   * @description Lista todos os eventos registrados
   * @returns Um array com os nomes dos eventos registrados
   */
  list_events(): string[] {
    return Array.from(this.events);
  }
}
