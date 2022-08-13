const EVENT_RENDER_ALL_BOOKS = 'EVENT_RENDER_ALL_BOOKS';
const BOOKS_DATA_KEY = '_books_data';

const textBelumSelesaiDibaca = 'Belum selesai dibaca';
const textSelesaiDibaca = 'Selesai dibaca';

const formInputBook = document.getElementById('inputBook');
const inputBookTitle = document.getElementById('inputBookTitle');
const inputBookAuthor = document.getElementById('inputBookAuthor');
const inputBookYear = document.getElementById('inputBookYear');
const inputBookIsComplete = document.getElementById('inputBookIsComplete');
const buttonBookSubmit = document.getElementById('bookSubmit');

const formSearchBook = document.getElementById('searchBook');
const searchBookTitle = document.getElementById('searchBookTitle');


inputBookIsComplete.addEventListener('change', function () {
    const spanElement = buttonBookSubmit.getElementsByTagName('span')[0];

    spanElement.innerText = textBelumSelesaiDibaca;
    if (inputBookIsComplete.checked) {
        spanElement.innerText = textSelesaiDibaca;
    }
});


formInputBook.addEventListener('submit', function(e) {
    e.preventDefault();

    const booksData =  getBooksDataFromStorage();

    const title = inputBookTitle.value;
    const author = inputBookAuthor.value;
    const year = inputBookYear.value;
    const isComplete = inputBookIsComplete.checked;

    e.target.reset();

    const bookItem = newBook(title, author, year, isComplete);
    booksData.push(bookItem);

    saveBooksDataToStorage(booksData);
});


function newBook(title, author, year, isComplete = false) {
    return {
        'id': +new Date(),
        'title': title,
        'author': author,
        'year': year,
        'isComplete': isComplete
    };
}


formSearchBook.addEventListener('submit', function(e) {
    e.preventDefault();

    bookTitle = searchBookTitle.value;
    renderAllBooks(bookTitle);
});


/**
 * Make the templates
 */
function makeBookItemTemplate(bookObject = {}) {
    const bookItemWrapperElement = document.createElement('article');
    const titleElement = document.createElement('h3');
    const authorElement = document.createElement('p');
    const yearElement = document.createElement('p');
    const actionWrapperElement = document.createElement('div');
    const btnSelesaiDibacaElement = document.createElement('button');
    const btnHapusBukuElement = document.createElement('button');

    bookItemWrapperElement.classList.add('book_item');
    btnSelesaiDibacaElement.classList.add('green');
    btnHapusBukuElement.classList.add('red');

    titleElement.innerText = bookObject.title;
    authorElement.innerText = `Penulis : ${bookObject.author}`;
    yearElement.innerText = `Tahun : ${bookObject.year}`;

    if (bookObject.isComplete) {
        btnSelesaiDibacaElement.innerText = textBelumSelesaiDibaca;
        btnSelesaiDibacaElement.setAttribute('onClick', `markAsUnread(${bookObject.id})`);
    } else {
        btnSelesaiDibacaElement.innerText = textSelesaiDibaca;
        btnSelesaiDibacaElement.setAttribute('onClick', `markAsRead(${bookObject.id})`);
    }


    btnHapusBukuElement.setAttribute('onClick', `deleteBook(${bookObject.id})`);
    btnHapusBukuElement.innerText = 'Hapus buku';

    actionWrapperElement.classList.add('action');
    actionWrapperElement.appendChild(btnSelesaiDibacaElement);
    actionWrapperElement.appendChild(btnHapusBukuElement);

    bookItemWrapperElement.setAttribute('id', `book-item-${bookObject.id}`);
    bookItemWrapperElement.appendChild(titleElement);
    bookItemWrapperElement.appendChild(authorElement);
    bookItemWrapperElement.appendChild(yearElement);
    bookItemWrapperElement.appendChild(actionWrapperElement);

    return bookItemWrapperElement;
}

/**
 * Render the books
 */
function renderAllBooks(bookTitle = null) {
    let booksData = getBooksDataFromStorage();

    const completeBookshelfList = document.getElementById('completeBookshelfList');
    completeBookshelfList.innerHTML = '';

    const incompleteBookshelfList = document.getElementById('incompleteBookshelfList');
    incompleteBookshelfList.innerHTML = '';

    if (bookTitle !== null && bookTitle.trim() !== '') {
        booksData = booksData.filter(function(book) {
            return book.title.toLowerCase().includes(bookTitle);
        });
    }

    for (const book of booksData) {
        const bookElement = makeBookItemTemplate(book);

        if (book.isComplete === true) {
            completeBookshelfList.append(bookElement);
        } else {
            incompleteBookshelfList.append(bookElement);
        }
    }
}


function isStorageAvailable() {
    if (typeof (window.Storage) !== 'undefined') {
        return true;
    }

    alert('Your browser does not support web storage');

    return false;
}


function getBooksDataFromStorage() {
    if (isStorageAvailable()) {
        let booksStorage = window.localStorage.getItem(BOOKS_DATA_KEY);

        if (booksStorage === null) {
            booksStorage = window.localStorage.setItem(BOOKS_DATA_KEY, JSON.stringify([]));
        }

        return booksStorage === null || typeof(booksStorage) === 'undefined'
            ? []
            : JSON.parse(booksStorage);
    }
}


function saveBooksDataToStorage(books) {
    localStorage.setItem(BOOKS_DATA_KEY, JSON.stringify(books));
    document.dispatchEvent(new Event(EVENT_RENDER_ALL_BOOKS));
}


function findBook(bookId) {
    const booksData = getBooksDataFromStorage();

    let idx = 0;

    for (const bookItem of booksData) {
        if (bookItem.id === bookId) {
            return {
                'index': idx,
                'book': bookItem
            };
        }

        idx++;
    }

    return null;
}


function markAsRead(bookId) {
    const booksData = getBooksDataFromStorage();
    const bookObject = findBook(bookId);

    if (bookObject === null) {
        return;
    };

    const bookIndex = bookObject.index;
    const bookItem = bookObject.book;

    booksData.splice(bookIndex, 1);

    bookItem.isComplete = true;
    booksData.push(bookItem);

    saveBooksDataToStorage(booksData);
}


function markAsUnread(bookId) {
    const booksData = getBooksDataFromStorage();
    const bookObject = findBook(bookId);

    if (bookObject === null) {
        return;
    };

    const bookIndex = bookObject.index;
    const bookItem = bookObject.book;

    booksData.splice(bookIndex, 1);

    bookItem.isComplete = false;
    booksData.push(bookItem);

    saveBooksDataToStorage(booksData);
}


function deleteBook(bookId) {
    const booksData = getBooksDataFromStorage();
    const bookObject = findBook(bookId);

    if (bookObject === null) {
        return;
    };

    const bookIndex = bookObject.index;
    booksData.splice(bookIndex, 1);

    saveBooksDataToStorage(booksData);
}


/**
 * Event listener here
 */
document.addEventListener(EVENT_RENDER_ALL_BOOKS, function() {
    renderAllBooks();
});

document.addEventListener('DOMContentLoaded', function() {
    document.dispatchEvent(new Event(EVENT_RENDER_ALL_BOOKS));
});

