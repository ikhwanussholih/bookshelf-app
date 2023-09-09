const bookshelf = [];
const RENDER_EVENT = 'render-bookshelf';
const SAVED_EVENT = 'saved-bookshelf';
const STORAGE_KEY = 'BOOKSHELF_APP';

function isStorageExist() {
    if (typeof (Storage) === 'undefined') {
        alert('Browser tidak mendukung Local Storage');
        return false;
    }
    return true;
}

function generateId() {
    return +new Date();
}

function generateBookshelfObject(id, title, author, year, isComplete) {
    return {
        id,
        title,
        author,
        year,
        isComplete,
    }
}

function makeBookshelf(bookshelfObject) {
    const { id, title, author, year, isComplete } = bookshelfObject;

    const textTitle = document.createElement('h2');
    textTitle.innerText = title;

    const textAuthor = document.createElement('p');
    textAuthor.innerText = "Penulis: " + author;

    const textYear = document.createElement('p');
    textYear.innerText = "Tahun: " + year;

    const textContainer = document.createElement('article');
    textContainer.classList.add('book_item');
    textContainer.append(textTitle, textAuthor, textYear);
    textContainer.setAttribute('id', `book-${id}`);

    const action = document.createElement('div');
    action.classList.add('action');

    const deleteButton = document.createElement('button');
    deleteButton.classList.add('red');
    deleteButton.innerText = 'Hapus Buku';
    deleteButton.addEventListener('click', function () {
        removeTaskFromCompleted(id);
    });


    if (isComplete) {
        const moveButtonDone = document.createElement('button');
        moveButtonDone.classList.add('green');
        moveButtonDone.innerText = 'Belum Selesai Dibaca';

        moveButtonDone.addEventListener('click', function () {
            undoTaskFromCompleted(id);
        });
        action.append(moveButtonDone);
    } else {
        const moveButton = document.createElement('button');
        moveButton.classList.add('green');
        moveButton.innerText = 'Selesai Dibaca';

        moveButton.addEventListener('click', function () {
            addTaskToCompleted(id);
        });
        action.append(moveButton);
    }
    action.append(deleteButton);
    textContainer.append(action);

    return textContainer;
}

function saveBook() {
    if (isStorageExist()) {
        const parsed = JSON.stringify(bookshelf);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
}

function addBook() {
    const textTitle = document.getElementById('inputBookTitle').value;
    const textAuthor = document.getElementById('inputBookAuthor').value;
    const textYear = document.getElementById('inputBookYear').value;
    const isComplete = document.getElementById('inputBookIsComplete').checked;

    const generateID = generateId();
    const bookshelfObject = generateBookshelfObject(generateID, textTitle, textAuthor, Number(textYear), isComplete);
    bookshelf.push(bookshelfObject);

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveBook();
}

document.addEventListener('DOMContentLoaded', function () {
    const submitForm = document.getElementById('inputBook');
    submitForm.addEventListener('submit', function (event) {
        event.preventDefault();
        addBook();
    });

    if (isStorageExist()) {
        loadDataFromStorage();
    }
});

document.addEventListener(RENDER_EVENT, function () {
    const uncompletedBookShelftList = document.getElementById('incompleteBookshelfList');
    uncompletedBookShelftList.innerHTML = '';
    const completedBookShelftList = document.getElementById('completeBookshelfList');
    completedBookShelftList.innerHTML = '';

    for (const bookItem of bookshelf) {
        const bookElement = makeBookshelf(bookItem);
        if (bookItem.isComplete) {
            completedBookShelftList.append(bookElement);
        } else {
            uncompletedBookShelftList.append(bookElement);
        }
    }
});

function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let books = JSON.parse(serializedData);

    if (books !== null) {
        for (const book of books) {
            bookshelf.push(book);
        }
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
}

function addTaskToCompleted(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isComplete = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveBook();
}

function findBook(bookId) {
    for (const bookItem of bookshelf) {
        if (bookItem.id === bookId) {
            return bookItem;
        }
    }
    return null;
}

function removeTaskFromCompleted(bookId) {
    const bookTarget = findBookIndex(bookId);

    if (bookTarget === -1) return;

    bookshelf.splice(bookTarget, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveBook();
}

function undoTaskFromCompleted(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isComplete = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveBook();
}

function findBookIndex(bookId) {
    for (const index in bookshelf) {
        if (bookshelf[index].id === bookId) {
            return index;
        }
    }

    return -1;
}


const filterBook = document.getElementById('searchBook');
filterBook.addEventListener('submit', function (search) {
    search.preventDefault();
    const inCompletedBookList = document.getElementById('incompleteBookshelfList');
    const completedBookList = document.getElementById('completeBookshelfList');
    const inputTitleSearch = document.getElementById('searchBookTitle').value;

    inCompletedBookList.innerHTML = '';
    completedBookList.innerHTML = '';

    const result = bookshelf.filter((book) => {
        // Kita lowercase semua agar case menjadi sama sehingga hasil pencarian menjadi ignoring case
        const bookTitle = book.title.toLowerCase();
        const searchKeyWord = inputTitleSearch.toLowerCase();

        return bookTitle.includes(searchKeyWord);
    });

    if (result.length === 0) {
        inCompletedBookList.innerHTML = 'Tidak Ditemukan';
        completedBookList.innerHTML = 'Tidak Ditemukan';
    } else {
        for (const bookItem of result) {
            const bookElement = makeBookshelf(bookItem);
            if (bookItem.isComplete) {
                completedBookList.append(bookElement);
            } else {
                inCompletedBookList.append(bookElement);
            }
        }
    }
});