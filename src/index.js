window.onload = function() {
    var hiddenCanvas = document.getElementById('hiddenCanvas');
    var displayedCanvas = document.getElementById('displayedCanvas');
    var hiddenContext = hiddenCanvas.getContext('2d');
    var displayedContext = displayedCanvas.getContext('2d');

    var image = new Image();

    image.onload = function() {
        hiddenContext.drawImage(image, 0, 100, hiddenCanvas.width, hiddenCanvas.height, 0, 0, hiddenCanvas.width, hiddenCanvas.height);
        // hiddenContext.drawImage(image, 100, 100, 50, 50);
        displayedContext.drawImage(image, 0, 100, displayedCanvas.width, displayedCanvas.height, 0, 0, displayedCanvas.width, displayedCanvas.height);

    };

    image.src = '/assets/test-image.jpg'; // Replace with the path to your image
};