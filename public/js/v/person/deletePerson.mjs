/**
 * @fileOverview  Contains various view functions for the use case deletePerson
 * @authors Gerd Wagner & Juan-Francisco Reyes (modified by Mina Lee)
 */
import Person from "../../m/Person.mjs";

    const formEl = document.forms["Person"],
          deleteButton = formEl.commit,
          selectPersonEl = formEl.selectPerson;
    // load all person records
    const personRecords = await Person.retrieveAll();
    for (const personRec of personRecords) {
      const optionEl = document.createElement("option");
      optionEl.text = personRec.name;
      optionEl.value = personRec.personId;
      selectPersonEl.add( optionEl, null);
    }
    // Set an event handler for the submit/delete button
    deleteButton.addEventListener("click",
        handleDeleteButtonClickEvent);

  async function handleDeleteButtonClickEvent() {
    const selectPersonEl = document.forms['Person'].selectPerson;
    const personId = selectPersonEl.value;
    if (personId) {
      await Person.destroy( personId);
      // remove deleted person from select options
      selectPersonEl.remove( selectPersonEl.selectedIndex);
    }
  }