import React  from 'react';
import ReactDOM from 'react-dom';
import throttle from 'lodash/throttle';
import { fromEvent } from 'rxjs';
import { throttleTime, map , flatMap, takeUntil, distinctUntilChanged } from 'rxjs/operators';


// Main code
const mainCode = () => {
    const mainContainer = document.querySelector('#DOMEvent');

    // RXJS - Click - 9 lines
    (() => {
        fromEvent(mainContainer.querySelector('.rxjs-button'), 'click')
            .pipe(
                throttleTime(400), //1st block
                map(evt => ({
                    x: evt.clientX,
                    y: evt.clientY
                })) //2nd block
            )
            .subscribe(coordination => console.log(coordination));
    })();

    // Non-RXJS - Click - 9 lines
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

    // RXJS - Drag drop - 23 lines
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
                        let left = mousemoveEvt.clientX - startX;
                        let top = mousemoveEvt.clientY - startY;

                        mousemoveEvt.preventDefault();

                        if (left < 0) {
                            left = 0;
                        } else if (left + draggableItem.clientWidth > window.innerWidth) {
                            left = window.innerWidth - draggableItem.clientWidth;
                        }

                        if (top < 0) {
                            top = 0;
                        } else if (top + draggableItem.clientHeight > window.innerHeight) {
                            top = window.innerHeight - draggableItem.clientHeight;
                        }

                        return { left, top };
                    }),
                    distinctUntilChanged((oldPos, newPos) => oldPos.left === newPos.left && oldPos.top === newPos.top),
                    takeUntil(mouseup)
                );
            })
        ).subscribe(position => {
            draggableItem.style.top = position.top + 'px';
            draggableItem.style.left = position.left + 'px';
        });
    })();

    // Non-RXJS - dragdrop - 24 lines
    (() => {
        let dragging = false;
        let oldPos = {};
        let startX, startY;

        const draggableItem = mainContainer.querySelector('.non-rxjs-draggable');
        const mousedown = (e) => {
            startX = e.offsetX;
            startY = e.offsetY;
            dragging = true;
        };
        const mousemove = (e) => {
            if (!dragging) {
                return;
            }

            e.preventDefault();

            const newPos = {
                left: e.clientX - startX,
                top: e.clientY - startY
            };

            if (newPos.left < 0) {
                newPos.left = 0;
            } else if (newPos.left + draggableItem.clientWidth > window.innerWidth) {
                newPos.left = window.innerWidth - draggableItem.clientWidth;
            }

            if (newPos.top < 0) {
                newPos.top = 0;
            } else if (newPos.top + draggableItem.clientHeight > window.innerHeight) {
                newPos.top = window.innerHeight - draggableItem.clientHeight;
            }

            if (oldPos.left !== newPos.left || oldPos.top !== newPos.top) {
                draggableItem.style.left = newPos.left + 'px';
                draggableItem.style.top = newPos.top + 'px';
                oldPos = newPos;
            }
        };
        const mouseup = () => {
            dragging = false;
        };

        draggableItem.addEventListener('mousedown', mousedown);
        document.addEventListener('mousemove', mousemove);
        draggableItem.addEventListener('mouseup', mouseup);
    })();
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
        <div>= DOM Event ====================================================</div>
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
