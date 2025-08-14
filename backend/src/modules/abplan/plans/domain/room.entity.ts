export class Room {
  constructor(
    private readonly _id: string,
    private readonly _name: string,
    private readonly _surface: number,
    private readonly _options: Record<string, any> = {},
  ) {
    if (!_name || _name.trim().length === 0) {
      throw new Error('Room name cannot be empty');
    }
    if (_surface <= 0) {
      throw new Error('Room surface must be positive');
    }
  }

  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get surface(): number {
    return this._surface;
  }

  get options(): Record<string, any> {
    return { ...this._options };
  }

  static create(name: string, surface: number, options: Record<string, any> = {}): Room {
    const id = Date.now().toString() + Math.random().toString(36).substring(2);
    return new Room(id, name, surface, options);
  }
}
