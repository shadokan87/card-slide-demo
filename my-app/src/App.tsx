import React, { useEffect, useState } from 'react';
import { Droppable, DragDropContext, Draggable } from "react-beautiful-dnd";
import './App.css';
const pageName = "Suivi Etudiants";
let cardId = 0;
let columnId = 0;
const getCardId = (): number => { return ((cardId++)); }
const getColumnId = (): number => { return ((columnId++)); }

interface item { id: number, name: string }
// used to store info about dragged items
//used for drag and drop: https://github.com/atlassian/react-beautiful-dnd
interface Dnd { name: string, index: number }
// each column is identified by an id.
// its name.
// a list of {item}
interface column {
    // id: number,
    //setter: React.Dispatch<React.SetStateAction<item[]>>,
    name: string,
    items: item[],
}

const addColumn = (__state: { value: Map<number, column>, setter: React.Dispatch<React.SetStateAction<Map<number, column>>> },
    data: column) => {
    let found: boolean = false;
    if (data.name === "") {
        alert("Name can't be empty.");
        return;
    }
    __state.value.forEach((col, key) => {
        if (data.name === col.name) {
            found = true;
            return ;
        }
    });
    if (found) {
        alert(`column with name ${data.name} already exists.`);
        return ;
    }
    __state.setter(new Map<number, column>(__state.value.set(getColumnId(), data)));
}
const addColumnAt = (__state: { value: Map<number, column>, setter: React.Dispatch<React.SetStateAction<Map<number, column>>> },
    key: number, data: column) => { __state.setter(new Map<number, column>(__state.value.set(key, data))); }

const deleteColumn = (__state: {
    value: Map<number, column>,
    setter: React.Dispatch<React.SetStateAction<Map<number, column>>>
},
    name: string) => {
        let found: boolean = false;
    __state.value.forEach((col, key) => {
        if (col.name === name) {
            __state.value.delete(key);
            const newMap = new Map<number, column>(__state.value);
            __state.setter(newMap);
            found = true;
            return ;
        }
    });
    if (!found)
        alert(`column with name ${name} not found.`);
}
// take two keys {lhs, rhs} and swap its map content
const swapColumn = (__state: {
    value: Map<number, column>,
    setter: React.Dispatch<React.SetStateAction<Map<number, column>>>
},
    src: Dnd, dst: Dnd) => {
    const array: any = Array.from(__state.value.entries());
    let newMap: Map<number, column> = new Map<number, column>();
    array.splice(dst.index, 0, array.splice(src.index, 1)[0]);
    array.forEach((element: any[2]) => {
        newMap.set(element[0], element[1]);
    });
    __state.setter(newMap);
}

const getColName = (columns: Map<number, column>, key: number) => {
    const col = columns.get(key);
    if (!col)
        return "";
    return (col.name);
}

function handleDragEnd(props: any, __state: {
    value: Map<number, column>,
    setter: React.Dispatch<React.SetStateAction<Map<number, column>>>
}) { //, setter: React.Dispatch<React.SetStateAction<{id: number, name: string}[]>>) {
    const dst: Dnd = {
        name: props.destination ? props.destination.droppableId : "",
        index: props.destination ? props.destination.index : -1,
    }
    const src: Dnd = {
        name: props.source ? props.source.droppableId : "",
        index: props.source ? props.source.index : -1,
    }
    if (dst.index === src.index) // case column / card did not move
        return;
    if (src.name === "slideColumns") {
        swapColumn(__state, src, dst);
    } else {

    }
    console.log(props);
    console.log(dst);
    console.log(src);
}


function OneColumn(props: { columns: Map<number, column>, __key: number, provided: any }) {
    return (
        <div className="column"
            ref={props.provided.innerRef}
            {...props.provided.draggableProps}
            style={{ ...props.provided.draggableProps.style }}>
            <div className="header"
                {...props.provided.dragHandleProps}
            ><h4>{getColName(props.columns, props.__key)}</h4></div>
            <UserCards __key={props.__key} columns={props.columns} />
        </div>
    );
}

function UserCards(props: { columns: Map<number, column>, __key: number }) {
    const column = props.columns.get(props.__key);
    if (!column)
        return (<>
            <h1>empty</h1>
        </>);
    return (<>
        {column.items.map((user, index) =>
            <div className="userCard" key={user.id}>
                <h4>{user.name}</h4>
            </div>
        )}
    </>)
}


function App() {
    const [columns, setColmns] = useState(() => {
        return (new Map<number, column>());
    });
    const [deleteCo, updateDeleteCo] = useState("");
    const [addCo, updateAddCo] = useState("");
    return (
        <div className="main">
            <button onClick={() => addColumn({ value: columns, setter: setColmns },
                {
                    name: deleteCo,
                    items: [{
                        id: getCardId(),
                        name: "testCard" + cardId,
                    },
                    {
                        id: getCardId(),
                        name: "testCard" + cardId,
                    }],
                })}>add</button>
            <button onClick={() => { deleteColumn({ value: columns, setter: setColmns }, deleteCo) }}>delete</button>
            <button onClick={() => { console.log(columns) }}>log</button>
            <input type="text" value={deleteCo} onChange={(e) => updateDeleteCo(e.target.value)} />
            <DragDropContext onDragEnd={(...props) => {
                console.log(props);
                handleDragEnd(props[0], { value: columns, setter: setColmns });
            }}>
                <Droppable droppableId="slideColumns" direction="horizontal">
                    {(provided, snapshot) => (
                        <div className="columnWrapper-slide"
                            {...provided.droppableProps}
                            ref={provided.innerRef}>
                            <div className="columnWrapper">
                                {[...columns.keys()].map((k, index) => (
                                    <Draggable draggableId={`draggable-${k}`} index={index} key={k}>
                                        {(provided, snapshot) => (
                                            <OneColumn columns={columns} __key={k} provided={provided} />
                                        )}
                                    </Draggable>
                                ))
                                }
                            </div>
                        </div>
                    )}
                </Droppable>
            </DragDropContext>

        </div>
    );
}

export default App;
