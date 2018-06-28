import React, { PureComponent } from 'react';
import ReactDOM from 'react-dom';
import throttle from 'lodash/throttle';
import { Subject, from, of } from 'rxjs';
import { debounceTime, switchMap, distinctUntilChanged, catchError } from 'rxjs/operators';


// Main code
class SearchService {
    constructor() {
        this.searchSubject = new Subject();
    }

    search(query, options = { limit: 10 }) {
        const url = `https://itunes.apple.com/search?term=${query}&entity=album&limit=${options.limit}`;

        this.searchSubject.next(url);
    }

    getResults() {
        return this.searchSubject.pipe(
            debounceTime(400),
            distinctUntilChanged(),
            // Cancellation happening here
            switchMap(url => {
                if (url) {
                    return from(
                        fetch(url)
                            .then(res => res.json())
                    );
                }

                return of([]);
            }),
            catchError(error => {
                console.error(error);

                return of([]);
            })
        )
    }
}

class ItunesSearch extends PureComponent {
    constructor(props) {
        super(props);

        this.searchService = new SearchService();
        this.state = { items: [] };
    }

    componentDidMount() {
        this.searchService
            .getResults()
            .subscribe(res => {
                this.setState({ items: res.results });
            })
    }

    search(query) {
        this.searchService.search(query.trim(), { limit: 10 });
    }

    render() {
        const { items } = this.state;

        return (
            <div>
                <input type="text" placeholder="Search query" className="search"
                       onChange={e => this.search(e.target.value)}
                />
                <ul className="albums">
                    {items && items.map(item => (
                        <li className="album" key={item.collectionId}>
                            <a href={item.collectionViewUrl} target="_blank">
                                <img src={item.artworkUrl100} />
                                <div>{item.collectionName}</div>
                                <div>{item.artistName}</div>
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        );
    }
}


//============================================
// setup
const div = document.createElement('DIV');

div.id = 'ReactAndRequest';

document
    .querySelector('#root')
    .appendChild(div);

ReactDOM.render(
    <div style={{marginTop: 300}}>
        <div>= Http Request ====================================================</div>
        <ItunesSearch/>
    </div>
    , div);
