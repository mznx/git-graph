export type Commit = {
    hash: string;
    text: string;
    time: string;
    previous: string[];
    branch: number;
    tag: string;
    x: number;
    y: number;
};

export type Tag = {
    commit: string;
    tag: string;
};

export type CommitQueue = Commit[];

export type CommitsObject = {
    commits: Commit[];
    tags: Tag[];
};

export type Coords = {
    x: number;
    y: number;
}

export type Mouse = {
    x: number;
    y: number;
    isPressed: boolean;
    isMoved: boolean;
}

export type ViewParams = {
    shift: Coords;
    margin: Coords;
    radius: number;
    x_max: number;
}