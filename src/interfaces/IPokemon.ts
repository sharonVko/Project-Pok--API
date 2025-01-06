export interface IPokemonList {
    count:    number;
    next:     string;
    previous: null;
    results:  IResult[];
}

export interface IResult {
    name: string;
    url:  string;
}

export interface IPokemon {
    id: number,
    name: string,
    sprites: IOther,
    types: IType[]
}

export interface IType {
    type: {name: string}
}

export interface IOther {
    other: IDreamWorld
}

export interface IDreamWorld {
    dream_world: IImgLink
}

export interface IImgLink {
    front_default: string
}