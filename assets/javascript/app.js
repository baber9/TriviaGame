var BibleTrivia = {
    // Link to AnswersBank
    questionsAnswersBank: globalAnswerBank,
    
    questionCount: 0,

    incorrectCount: 0,

    unansweredCount: 0,
    
    correctCount: 0,

    bibleVerse: "",

    // METHOD to get random number - calls displayQuestion
    getRandomQuestion: function() {
        this.clearDivs();
        var randomIndex = Math.floor(Math.random() * this.questionsAnswersBank.length);
        this.displayQuestion(this.questionsAnswersBank[randomIndex]);
    },
    // METHOD to display question
    displayQuestion: function(question) {
        // Increment Question Count
        this.questionCount++;
        // Display time
        $("#time").html('Time Remaining:&nbsp; <span id="timer">7</span> second(s)')

        // start TIMER, if not answered in time, null answer in callback
        this.startTimer(7, function() {
            BibleTrivia.checkAnswer(null, question);
        });

        $("#question").html(question.title);

        // Adds answer from object to answers array
        question.choices.push(question.answer);

        // Displays all answers
        for (i = 0; question.choices.length > 0; i++) {
            // Clear current answer#
            $("#answer-" +  i).html("");
            var randomIndex = Math.floor(Math.random() * (question.choices.length));
            $("#answer-" + i).append(question.choices[randomIndex]);
            question.choices.splice(randomIndex, 1);
        }
        
        // Remove question from array, so that it isn't repeated
        this.questionsAnswersBank.splice(this.questionsAnswersBank.indexOf(question), 1);
        $(".answer-block").children("div").on("click", function () {
            var userAnswer;
            userAnswer = $(this).text();
            BibleTrivia.checkAnswer(userAnswer, question);
        }); 
        
        // This calls ajax (API) early, so that vars will populate before answer page
        this.getBibleVerse(question.reference);
    },
    // METHOD starts timer (accepts callback)
    startTimer: function (time, callback) {
        var intervalID;
    
        // if answer is clicked, stop timer
        $(".answer-block").children("div").on("click", function () {
            clearInterval(intervalID)});
        
        var intervalID = setInterval(decrement, 1000);
        
        function decrement() {
            time--;
            $("#timer").html(time);
            if (time === 0) {
                clearInterval(intervalID);
                // callback is used to in displayQuestion to null
                callback();
            }
        }
    },

    // METHOD used to clear all divs between question and answer screens
    clearDivs: function () {
        $("#time").empty();
        $("#question").empty();
        $("#next-question").hide();
        for (i = 0; i < 4; i++) {
            $("#answer-" + i).empty();
        }
    },

    // METHOD to check answer, calls displayAnswer
    checkAnswer: function (userAnswer, bankQuestion) {
        var result;
        if (userAnswer === bankQuestion.answer) {
            result = "Right!";
            this.correctCount++;
        } else if (userAnswer === null) {
            result = "Out of Time!";
            this.unansweredCount++;
        } else {
            result = "Sorry!";
            this.incorrectCount++;
        }
        
        this.displayAnswer(result, userAnswer, bankQuestion);
    },

    // METHOD to display the answer (after response or timeout)
    displayAnswer: function (result, userAnswer, bankQuestion) {
        this.clearDivs();
        
        // turn off clicking
        $(".answer-block").children("div").off("click") 
        
        // displays right, sorry, or out of time
        $("#question").html(result);

        // displays correct answer
        if (result === "Right!") {
            $("#answer-0").html(`"${userAnswer}" is correct!`);
        } else if (result === "Sorry!") {
            // $("#answer-0").html(`"${userAnswer}" is incorrect!`);
            $("#answer-0").html(`The correct answer is "${bankQuestion.answer}".`);
        } else {
            $("#answer-0").html(`"${bankQuestion.answer}" is the correct answer.`);
        }
        
        // using questionCount to set length of game (10 = 10 total questions)
        if (this.questionCount < 10) {
            // Next Question Button
            $("#next-question").attr("value", "Next Question").show().on("click", function() {
                // MUST USE UNBIND or it calls getRandomQuestion multiple times!
                $("#next-question").unbind().hide();
                BibleTrivia.getRandomQuestion();
            });
        } else {
            $("#next-question").hide();
            // Display animated gif instead of button ("Calculating Score")
            var timerImg = $("<img>").attr("src", "./assets/images/calculating.gif");
            $("#answer-3").text("Just a moment while we calculate your score...");
            $("#answer-2").append(timerImg);
            setTimeout(this.endGame, 5000);
        }
        
        // Everything below is from API call
            // this is the verse (ex, job 2:1)
        var verse = bankQuestion.reference.substring(1, bankQuestion.reference.length - 1);
        var readMoreLink = "https://biblia.com/books/nasb95/" + verse.replace(/\s/g, ' ');
        var linkDiv = $("<a></a>").text("Read More").attr("href", readMoreLink).attr("target", "new");
        
        // Only include "Read More" link if api received a response
        if (bibleVerse) {
            $("#answer-1").html(`${bibleVerse}`).append(linkDiv);
        } else {
            $("#answer-1").html(`${bibleVerse}`);
        }
    
    },

    // METHOD uses biblia api to 'get' referenced bible verse and attaches a "Read More" anchor
    getBibleVerse: function (verse) {
        
        // remove parenths from verse
        verse = verse.substring(1, verse.length - 1);

        // setup query string
        var queryUrl = "http://api.biblia.com/v1/bible/content/KJV1900.txt.txt?passage=" + verse + "&callback=myCallbackFunction&key=";
        var apik = "051aecee5b057900c8b82933d40bf972"

        $.ajax({
            url: queryUrl + apik, 
            method: 'GET',
            success: (function(response) {
                // Load var with info from response
                bibleVerse = (`${verse} : ${response.substring(0, 200)}...`);
            }),
            //Don't display on error
            error: (function(){
                // Load blank if error
                bibleVerse = "";
            })
        })
    },
    
    // METHOD to end the game and show results
    endGame: function() {
        BibleTrivia.clearDivs();
        $("#time").text("As Jesus once said...");
        $("#question").html("'It is finished'.. Here's how you did!");
        $("#answer-0").html(`Correct Answers: ${BibleTrivia.correctCount}`);
        $("#answer-1").html(`Incorrect Answer(s): ${BibleTrivia.incorrectCount}`)
        $("#answer-2").html(`Unanswered: ${BibleTrivia.unansweredCount}`);
        $("#answer-3").html(`Final Score: ${Math.floor((BibleTrivia.correctCount/BibleTrivia.questionCount)*100)}%`);
        $("#next-question").attr("value", "Start Over?").show().on("click", function() {
            // Reset Counters and Continue
            BibleTrivia.incorrectCount = 0;
            BibleTrivia.unansweredCount = 0;
            BibleTrivia.correctCount = 0; 
            BibleTrivia.questionCount = 0;
            $("#next-question").unbind().hide();
            BibleTrivia.getRandomQuestion();
        });
    },

    // METHOD to start game (auto-called onload)
    startGame: function () {
        $("#time").text("Welcome to Bible Trivia!");
        $("#question").html("To get started, click the 'Start' button below...");
        $("#next-question").attr("value", "Start").show().on("click", function() {
        $("#next-question").unbind().hide();
        BibleTrivia.getRandomQuestion();
        });
    }

};

// START GAME
$(document).ready(BibleTrivia.startGame());

