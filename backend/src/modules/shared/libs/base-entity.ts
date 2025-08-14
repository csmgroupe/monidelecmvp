import { Entity, Property } from "@mikro-orm/core";
import { uuidv7 } from "uuidv7";

@Entity({
  abstract: true,
})
export abstract class BaseEntity {
  @Property({
    onCreate: () => uuidv7(),
    primary: true,
  })
  public id: string;

  @Property({
    onCreate: () => new Date(),
    nullable: true,
  })
  public createdAt: Date;

  @Property({
    onCreate: () => new Date(),
    onUpdate: () => new Date(),
    nullable: true,
  })
  public updatedAt: Date;

  clone(): this {
    const next = new (this.constructor as any)();
    Object.assign(next, this);
    return next as this;
  }
}
