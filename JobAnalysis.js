class Job {
    constructor({ Title, Posted, Type, Level, Skill, Detail }) {
        this.title = Title;
        this.postedTime = Posted;
        this.jobType = Type;
        this.experienceLevel = Level;
        this.requiredSkill = Skill;
        this.description = Detail;
    }

    getJobDetails() {
        return `
            <strong>Type:</strong> ${this.jobType}<br>
            <strong>Level:</strong> ${this.experienceLevel}<br>
            <strong>Skill:</strong> ${this.requiredSkill}<br>
            <strong>Time Posted:</strong> ${this.postedTime}<br>
            <strong>Description:</strong> ${this.description}
        `;
    }

    normalizePostedTime() {
        const timeMatch = this.postedTime.match(/(\d+)\s(minutes?|hours?|days?)\sago/);
        if (!timeMatch) return 0;
        const timeValue = parseInt(timeMatch[1]);
        const timeUnit = timeMatch[2].toLowerCase();
        if (timeUnit.includes("minute")) return timeValue;
        if (timeUnit.includes("hour")) return timeValue * 60;
        if (timeUnit.includes("day")) return timeValue * 1440;
    }
}

let jobList = [];
let filteredJobList = [];

document.getElementById("fileInput").addEventListener("change", handleFileUpload);
document.getElementById("filterButton").addEventListener("click", applyFilters);
document.getElementById("sortTitleAsc").addEventListener("click", () => sortJobs('title', 'asc'));
document.getElementById("sortTitleDesc").addEventListener("click", () => sortJobs('title', 'desc'));
document.getElementById("sortTimeAsc").addEventListener("click", () => sortJobs('time', 'asc'));
document.getElementById("sortTimeDesc").addEventListener("click", () => sortJobs('time', 'desc'));

function handleFileUpload(event) {
    const uploadedFile = event.target.files[0];
    const fileReader = new FileReader();
    fileReader.onload = () => {
        try {
            const jobData = JSON.parse(fileReader.result);
            jobList = jobData.map(jobEntry => new Job(jobEntry));
            populateFilterOptions(jobList);
            displayJobListings(jobList);
        } catch (error) {
            alert("Invalid JSON file format. Please upload a valid file.");
        }
    };
    fileReader.readAsText(uploadedFile);
}

function populateFilterOptions(jobArray) {
    const levels = new Set(jobArray.map(job => job.experienceLevel));
    const types = new Set(jobArray.map(job => job.jobType));
    const skills = new Set(jobArray.map(job => job.requiredSkill));

    populateDropdown("levelFilter", levels);
    populateDropdown("typeFilter", types);
    populateDropdown("skillFilter", skills);
}

function populateDropdown(elementId, optionSet) {
    const dropdownElement = document.getElementById(elementId);
    dropdownElement.innerHTML = `<option value="all">All</option>`;
    optionSet.forEach(optionValue => {
        const optionElement = document.createElement("option");
        optionElement.value = optionValue;
        optionElement.textContent = optionValue;
        dropdownElement.appendChild(optionElement);
    });
}

function applyFilters() {
    const selectedLevel = document.getElementById("levelFilter").value;
    const selectedType = document.getElementById("typeFilter").value;
    const selectedSkill = document.getElementById("skillFilter").value;

    filteredJobList = jobList.filter(job => {
        return (selectedLevel === "all" || job.experienceLevel === selectedLevel) &&
               (selectedType === "all" || job.jobType === selectedType) &&
               (selectedSkill === "all" || job.requiredSkill === selectedSkill);
    });

    displayJobListings(filteredJobList);
}

function sortJobs(sortCriteria, sortOrder) {
    filteredJobList.sort((jobA, jobB) => {
        if (sortCriteria === 'title') {
            return sortOrder === 'asc' 
                ? jobA.title.localeCompare(jobB.title) 
                : jobB.title.localeCompare(jobA.title);
        } else if (sortCriteria === 'time') {
            return sortOrder === 'asc'
                ? jobA.normalizePostedTime() - jobB.normalizePostedTime()
                : jobB.normalizePostedTime() - jobA.normalizePostedTime();
        }
    });
    displayJobListings(filteredJobList);
}

function displayJobListings(jobArray) {
    const jobContainer = document.getElementById("jobList");
    jobContainer.innerHTML = "";
    jobArray.forEach(job => {
        const jobListItem = document.createElement("li");
        jobListItem.className = "job-item";
        jobListItem.innerHTML = `
            <div class="job-header">
                <strong>${job.title}</strong>
                <button onclick="toggleJobDetails(this)">Details</button>
            </div>
            <div class="job-details">${job.getJobDetails()}</div>
        `;
        jobContainer.appendChild(jobListItem);
    });
}

function toggleJobDetails(buttonElement) {
    const detailsElement = buttonElement.parentElement.nextElementSibling;
    detailsElement.classList.toggle("show-details");
}
