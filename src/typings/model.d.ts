interface PrimitiveModel {
  model: "primitive";
  type: "string" | "number" | "boolean";
}

interface IndexModel {
  model: "index";
  key: string;
  value: Model;
}

interface ObjectModel {
  model: "object";
  index: IndexModel[];
}

interface ArrayModel {
  model: "array";
  item: Model;
}

interface TupleModel {
  name: 'tuple';
  items: Model[];
}

interface UnionModel {
  name: 'union';
  items: Model[];
}

interface IntersectionModel {
  name: 'intersection';
  items: Model[];
}

interface RefModel {
  name: 'ref';
  ref: string;
}

interface InterfaceModel {
  model: "interface";
  name: string;
  description?: string;
  index: IndexModel[];
}

interface TypeAliasModel {
  model: "type-alias";
  name: string;
  description?: string;
  value: Model;
}

type EntryModel = InterfaceModel | TypeAliasModel;

declare type Model =
  | PrimitiveModel
  | IndexModel
  | ObjectModel
  | ArrayModel
  | TupleModel
  | RefModel
  | UnionModel
  | IntersectionModel
  | EntryModel;
