import React  from 'react';
import ReactDOM from 'react-dom';
import throttle from 'lodash/throttle';
import { fromEvent } from 'rxjs';
import { throttleTime, map, filter, flatMap, takeUntil } from 'rxjs/operators';


// Main code
const mainCode = () => {
    const mainContainer = document.querySelector('#DOMEvent');

    // RXJS - Click
    (() => {
        fromEvent(mainContainer.querySelector('.rxjs-button'), 'click')
            .pipe(
                throttleTime(400),
                map(evt => ({
                    x: evt.clientX,
                    y: evt.clientY
                })),
                filter(coordination => co)
            )
            .subscribe(coordination => console.log(coordination));
    })();

    // Non-RXJS - Click
    (() => {
        const button = mainContainer.querySelector('.non-rxjs-button');
        const onButtonClick = throttle((evt) => {
            const corrdination = {
                x: evt.clientX,
                y: evt.clientY
            };

            console.log(corrdination);
        }, 400);

        button.addEventListener('click', onButtonClick);
    })();

    // RXJS - Drag drop
    (() => {
        const draggableItem = mainContainer.querySelector('.draggable');
        const mousedown = fromEvent(draggableItem, 'mousedown');
        const mousemove = fromEvent(document, 'mousemove');
        const mouseup = fromEvent(draggableItem, 'mouseup');

        mousedown.pipe(
            flatMap(mousedownEvt => {
                const startX = mousedownEvt.offsetX;
                const startY = mousedownEvt.offsetY;

                return mousemove.pipe(
                    map(mousemoveEvt => {
                        mousemoveEvt.preventDefault();

                        return {
                            left: mousemoveEvt.clientX - startX,
                            top: mousemoveEvt.clientY - startY
                        };
                    }),
                    takeUntil(mouseup)
                );
            })
        ).subscribe(position => {
            draggableItem.style.top = position.top + 'px';
            draggableItem.style.left = position.left + 'px';
        });
    })();

    // Non-RXJS - dragdrop
};

//============================================
// setup
const div = document.createElement('DIV');

div.id = 'DOMEvent';

document
    .querySelector('#root')
    .appendChild(div);

ReactDOM.render(
    <div>
        <button type="button" className="rxjs-button">RxJS - click</button>
        <button type="button" className="non-rxjs-button">Non-RxJS - click</button>
        <div className="draggable">
            RxJS
        </div>
        <div className="non-rxjs-draggable">
            Non-RxJS
        </div>
    </div>
, div, mainCode);
