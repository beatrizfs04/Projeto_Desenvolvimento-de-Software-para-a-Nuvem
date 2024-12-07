function parseCSVFileAndWriteToFileWithSpaces(file, outputFileName) {
    const reader = new FileReader();

    reader.onload = function(event) {
        const csvString = event.target.result;
        const rows = csvString.trim().split('\n');

        // Open a Blob to write lines to a .txt file
        const blobContent = [];

        // Process each row, replacing commas with spaces, and add to blobContent
        rows.forEach((row) => {
            const rowWithSpaces = row.replace(/,/g, ' '); // Replace commas with spaces
            blobContent.push(rowWithSpaces + "\n");
        });

        // Create a Blob from the rows and trigger download
        const blob = new Blob(blobContent, { type: 'text/plain' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = outputFileName;
        link.click();

        console.log(`File written as ${outputFileName}`);
    };

    reader.onerror = function() {
        console.error("Failed to read the file.");
    };

    reader.readAsText(file);
}

const fileInput = document.getElementById("bookInsert");
fileInput.addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const outputFileName = 'output_with_spaces.txt'; // Define the output .txt file name
        parseCSVFileAndWriteToFileWithSpaces(file, outputFileName);
    }
});