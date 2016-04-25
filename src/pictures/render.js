'use strict';

var galleryModule = require('../gallery/gallery');
var utilsModule = require('../utils');

var elementToClone;
var templateElement = document.querySelector('#picture-template');

// Для IE
if ('content' in templateElement) {
  elementToClone = templateElement.content.querySelector('.picture');
} else {
  elementToClone = templateElement.querySelector('.picture');
}

// Создаем блок фотографии на основе шаблона
var getPictureElement = function(data, container) {
  var element = elementToClone.cloneNode(true);
  element.querySelector('.picture-comments').textContent = data.comments;
  element.querySelector('.picture-likes').textContent = data.likes;

  // Создаем изображения
  var image = element.querySelector('img');

  var pictureImage = new Image();

  // Обработчик загрузки
  pictureImage.onload = function() {
    // Отмена таймаута
    clearTimeout(imageLoadTimeout);
    image.src = data.url;
    image.width = utilsModule.IMAGE_SIZE;
    image.height = utilsModule.IMAGE_SIZE;
    image.alt = data.date;
  };

  // Обработчик ошибки
  pictureImage.onerror = function() {
    image.classList.add('picture-load-failure');
  };

  pictureImage.src = data.url;

  // Таймаут
  var imageLoadTimeout = setTimeout(function() {
    image.src = '';
    image.classList.add('picture-load-failure');
  }, 5000);

  // Обработчик события при клике на галерею
  element.addEventListener('click', function(evt) {
    evt.preventDefault();
    if (evt.target.nodeName !== 'IMG') {
      return false;
    }
    var list = utilsModule.getFilteredPictures();
    var index = 0;
    for (var i = 0; i < list.length; i++) {
      if (data.url === list[i].url) {
        index = i;
      }
    }

    galleryModule.showGallery(index);
    return true;
  });

  container.appendChild(element);
  return element;
};

// Отрисовка картинки по скроллу или дорисовка на экране с широким разрешением
var drawNextPages = function() {
  utilsModule.pageNumber++;
  renderPictures(utilsModule.filteredPictures, utilsModule.pageNumber);
};

// Отрисовка всех картинок
var renderPictures = function(pictures, page, replace) {
  if(replace) {
    utilsModule.picturesContainer.innerHTML = '';
  }

  var from = page * utilsModule.PAGE_SIZE;
  var to = from + utilsModule.PAGE_SIZE;

  pictures.slice(from, to).forEach(function(picture) {
    getPictureElement(picture, utilsModule.picturesContainer);
  });

  // Отрисовать все фото на экране с большим разрешением
  var picturesContainerHeight = parseFloat(getComputedStyle(utilsModule.picturesContainer).height);

  var blockIsNotFull = function() {
    return window.innerHeight - picturesContainerHeight > 0;
  };

  var renderNextPages = function() {
    while (blockIsNotFull() && utilsModule.isNextPageAvailable(pictures, utilsModule.pageNumber, utilsModule.PAGE_SIZE)) {
      drawNextPages();
    }
  };

  renderNextPages();
};

module.exports = {
  drawNextPages: drawNextPages,
  renderPictures: renderPictures,
  getPictureElement: getPictureElement
};