// ===============================

// AI RECORD PRESERVER

// ===============================



let records = [];



// ===============================

// BUTTON EVENTS

// ===============================



document.getElementById("uploadBtn").addEventListener("click", uploadRecord);

document.getElementById("searchBtn").addEventListener("click", searchRecords);

document.getElementById("sendChat").addEventListener("click", sendMessage);



document.getElementById("chatInput").addEventListener("keypress", function(e){

    if(e.key === "Enter"){

        sendMessage();

    }

});



// ===============================

// UPLOAD RECORD

// ===============================



function uploadRecord(){



    const title = document.getElementById("recordTitle").value.trim();

    const file = document.getElementById("fileInput").files[0];

    const reader = new FileReader();


    if(title === ""){

        alert("Please enter a record title.");

        return;

    }



    if(!file){

        alert("Please choose a file.");

        return;

    }



    const record = {



        id: Date.now(),



        title: title,



        fileName: file.name,



        fileType: file.type || "Unknown",



        fileSize: (file.size / 1024).toFixed(2) + " KB",



        uploadDate: new Date().toLocaleString(),



        summary: "AI Analysis Coming Soon..."



    };

    reader.onload = async function() {


    record.content = reader.result;


    if (file.type.startsWith("text")) {
    try {
        record.summary = await analyzeWithAI(record.content);
    } catch (error) {
        console.error(error);
        record.summary = "AI analysis failed.";
    }
} else {
    record.summary = "AI analysis is currently available only for text documents.";
}


    records.unshift(record);


    saveRecords();



    saveRecord(record);

 
    displayRecords();

 
    document.getElementById("recordTitle").value = "";

 
    document.getElementById("fileInput").value = "";

 
    alert("Record Uploaded Successfully!");

};

if (file.type.startsWith("text") || file.name.endsWith(".json")) {
    reader.readAsText(file);
} else {
    reader.readAsDataURL(file);
}

// ===============================

// SAVE

// ===============================



if (db) {
    saveRecord(record);
} else {
    console.log("Database not ready.");
}
    // No longer needed.


}



// ===============================

// DISPLAY RECORDS

// ===============================



function displayRecords(list = records){



    const container = document.getElementById("recordList");



    container.innerHTML = "";



    if(list.length === 0){



        container.innerHTML = "<p>No Records Found.</p>";



        return;



    }



    list.forEach(function(record){



        const card = document.createElement("div");



        card.className = "record-card";



        card.innerHTML = `



            <h3>${record.title}</h3>



            <p><strong>File:</strong> ${record.fileName}</p>



            <p><strong>Type:</strong> ${record.fileType}</p>



            <p><strong>Size:</strong> ${record.fileSize}</p>



            <p><strong>Uploaded:</strong> ${record.uploadDate}</p>



            <p>${record.summary}</p>



            <button class="delete-btn" onclick="deleteRecord(${record.id})">



                Delete



            </button>



        `;



        container.appendChild(card);



    });



}



// ===============================

// DELETE

// ===============================



function deleteRecord(id){


    records = records.filter(function(record){

 
       return record.id !== id;


    });

 
   deleteRecordFromDB(id);

 
   displayRecords();


}



// ===============================

// SEARCH

// ===============================



function searchRecords(){



    const query = document

        .getElementById("searchInput")

        .value

        .toLowerCase()

        .trim();



    if(query === ""){



        displayRecords();



        return;



    }



    const filtered = records.filter(function(record){



        return (



            record.title.toLowerCase().includes(query) ||



            record.fileName.toLowerCase().includes(query) ||



            record.fileType.toLowerCase().includes(query)



        );



    });



    displayRecords(filtered);



}



// ===============================

// AI CHAT

// ===============================



function sendMessage(){



    const input = document.getElementById("chatInput");



    const text = input.value.trim();



    if(text === "") return;



    addMessage("You", text);



    setTimeout(function(){



        let reply = "";



        if(records.length === 0){



            reply = "Your vault is empty.";



        }else{



            reply = "Your vault currently contains " + records.length + " record(s).";



        }



        addMessage("AI", reply);



    },300);



    input.value = "";



}



// ===============================

// ADD CHAT MESSAGE

// ===============================



function addMessage(sender,text){



    const chat = document.getElementById("chatMessages");



    const div = document.createElement("div");



    div.className = "message";



    div.innerHTML = "<strong>" + sender + ":</strong> " + text;



    chat.appendChild(div);



    chat.scrollTop = chat.scrollHeight;



}

async function analyzeWithAI(text) {

    const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + GEMINI_API_KEY,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text:
                        "Summarize this document in 3-5 sentences and list 5 important keywords.\n\n" + text
                    }]
                }]
            })
        }
    );

    const data = await response.json();

    return data.candidates[0].content.parts[0].text;

}
