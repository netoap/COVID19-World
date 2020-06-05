'use'
document.addEventListener('DOMContentLoaded', ()=>{
    
    /************************
     * VARIABLES DECLATIONS
     ************************/
    const tbody = document.getElementById('country-table');
    const countryCard = document.getElementById('countryCard');
    let totalConfirmed = 0;
    let totalRecovered = 0;
    let totalDeaths = 0;

    let todayConfirmed = 0;
    let todayRecovered = 0;
    let todayDeaths = 0;

    const colorRed = 'color-arrow-red';
    const colorGreen = 'color-arrow-green';
    const arrowUp = 'fa-arrow-up';
    const arrowDown = 'fa-arrow-down';

    /************************
     * FUNCTIONS 
     ************************/
    const getAllCountries =()=>{
        return fetch('https://pomber.github.io/covid19/timeseries.json')
        .then(response => {
            if(!response.ok){
                throw new Error('A url está incorreta');
            }
            return response.json();
        })
        .then(data => data)    
    } 

    getAllCountries()
        .then(response => {
            generateTable(response)
            createCountryCard()
            save(response)
        })
        .catch(err=> console.log(err.message)) 

    createCountryCard = ()=>{
        countryCard.innerHTML = `
            <div class="country card bg-warning">
                <div class="card-body text-white text-center">
                <h4 class="card-title" >Confirmados</h4>
                <h5 class="card-text">${formatNumber(totalConfirmed)}</h5>
                <h6>[ Hoje: +${formatNumber(todayConfirmed)} ]</h6>
                </div>          
            </div>
            <div class="country card bg-success">
                <div class="card-body text-white text-center">
                <h4 class="card-title" >Recuperados</h4>
                <h5 class="card-text">${formatNumber(totalRecovered)}</h5>
                <h6>[ Hoje: +${formatNumber(todayRecovered)} ]</h6>
                </div>          
            </div>
            <div class="country card bg-danger">
                <div class="card-body text-white text-center">
                <h4 class="card-title" >Mortes</h4>
                <h5 class="card-text">${formatNumber(totalDeaths)}</h5>
                <h6>[ Hoje: +${formatNumber(todayDeaths)} ]</h6>
                </div>          
            </div> ` 
    }                   

    formatNumber = num =>{
        return new Intl.NumberFormat().format(num)
    }

    const generateTable = countries => {
        for(let countryName in countries){
            let tr = document.createElement('tr') ;
              
            let countriesDummy = [...countries[countryName]];
            let lastObj = countriesDummy.pop();
      
            let secondLastObj = countriesDummy.pop();
            
            let countryConfirmedId = `${countryName}_confirmed`;
            let countryDeathsId = `${countryName}_deaths`;
            let countryRecoveredId = `${countryName}_recovered`;

            //CALC
            let confirmedDiff = lastObj.confirmed - secondLastObj.confirmed;
            let deathsDiff = lastObj.deaths - secondLastObj.deaths;
            let recoveredDiff = lastObj.recovered - secondLastObj.recovered;

            //UI TABLE
            tr.innerHTML = `
                <th scope="row">${countryName}</th>
                <td>${lastObj.date}</td>
                <td>${lastObj.confirmed} <span id="${countryName}_span_confirmed">[<i class="fas " id="${countryConfirmedId}"></i> ${confirmedDiff}]</span></td>
                <td>${lastObj.deaths} <span id="${countryName}_span_deaths">[<i class="fas " id="${countryDeathsId}"></i> ${deathsDiff}]</span></td>
                <td>${lastObj.recovered} <span id="${countryName}_span_recovered">[<i class="fas " id="${countryRecoveredId}"></i> ${recoveredDiff}]</span></td>
            `
            // CALC TOTAL
            totalConfirmed += lastObj.confirmed;
            totalRecovered += lastObj.recovered;
            totalDeaths += lastObj.deaths;
            // CALC TODAY
            todayConfirmed += lastObj.confirmed - secondLastObj.confirmed;
            todayRecovered += lastObj.recovered - secondLastObj.recovered;
            todayDeaths += lastObj.deaths - secondLastObj.deaths;

            tbody.appendChild(tr)
            
            let iconConfirmed = document.getElementById(countryConfirmedId);
            let iconDeaths = document.getElementById(countryDeathsId);
            let iconRecovered = document.getElementById(countryRecoveredId);

            let spanConfirmed = document.getElementById(`${countryName}_span_confirmed`);
            let spanDeaths = document.getElementById(`${countryName}_span_deaths`);
            let spanRecovered = document.getElementById(`${countryName}_span_recovered`);
            
            // CONFIRMED CASES
            cases(confirmedDiff, spanConfirmed, iconConfirmed, arrowUp, arrowDown, colorRed, colorGreen);
            // DEATHS CASES
            cases(deathsDiff, spanDeaths, iconDeaths, arrowUp, arrowDown, colorRed, colorGreen);
            // RECOVERED CASES 
            if( recoveredDiff > 0){    
                spanRecovered.style.display='inline-block';     
                addClassIcon(iconRecovered,arrowUp,colorGreen);
            }else if(recoveredDiff==0){  
                removeClassIcon(iconRecovered,arrowUp);    
                removeClassIcon(iconRecovered,arrowDown);  
                removeClassIcon(iconRecovered,colorRed); 
                removeClassIcon(iconRecovered,colorGreen);
                spanRecovered.style.display='none';    
            }else{       
                spanRecovered.style.display='inline-block';
                addClassIcon(iconRecovered, arrowDown, colorRed);
            }     
        }  
    } 

    const cases = (diff, span, icon, arrowUp, arrowDown, colorRed, colorGreen)=>{
        if( diff > 0){
            span.style.display='inline-block';
            addClassIcon(icon,arrowUp,colorRed);         
        }else if(diff == 0){
            removeClassIcon(icon,arrowUp);  
            removeClassIcon(icon,arrowDown);   
            removeClassIcon(icon,colorRed); 
            removeClassIcon(icon,colorGreen);
            span.style.display='none';            
        }else{
            span.style.display='inline-block';
            addClassIcon(icon, arrowDown, colorGreen);
        }
    }
    /**************
     * CLASS
     **************/
    const yesterdayDate = () =>{
        var d = new Date();
        d.setDate(d.getDate() -1);
        return d.toLocaleDateString();
    }
    class Store {
        static getCountries(){
            let countries;
            if(localStorage.getItem(yesterdayDate())=== null){
                countries = [];
            }else{
                countries = JSON.parse(localStorage.getItem(yesterdayDate()));
            }
            return countries;
        }

        static addCountry(country){
            const countries = Store.getCountries();
            let hasEqualCountry = false;

            countries.forEach(element => {
                if(isEqual(element, country)){
                    hasEqualCountry = true;
                }
            });
            
            if(!hasEqualCountry){
                countries.push(country);
                localStorage.setItem(yesterdayDate(), JSON.stringify(countries));   
            }         
        }
    }
    const save = countries => {
        for(let countryName in countries){         
            let countriesDummy = [...countries[countryName]];
            let lastObj = countriesDummy.pop();
            let country = new Country(countryName, lastObj.date, lastObj.confirmed, lastObj.recovered, lastObj.deaths);
            Store.addCountry(country);
        }
    }
   
    const isEqual = (obj1, obj2) => {
        const obj1Keys = Object.keys(obj1);
        const obj2Keys = Object.keys(obj2);

        if(obj1Keys.length !== obj2Keys.length){
            return false;
        }
        for(let objKey of obj1Keys){
            if(obj1[objKey] !== obj2[objKey]){
                return false;
            }
        }
        return true;
    }

    function Country(name, date, confirmed, recovery, deaths){
        this.name = name;
        this.date = date;
        this.confirmed= confirmed;
        this.recovery=recovery;
        this.deaths = deaths;
    } 

    removeClassIcon = (icon, cssClass)=> {
        if (icon.classList.contains(cssClass))
            icon.classList.remove(cssClass);
    }

    addClassIcon = (icon, cssClassArrow, cssClassColor)=>{
        icon.classList.add(cssClassArrow, cssClassColor);
    }   
    
});


// https://stackoverflow.com/questions/195951/how-can-i-change-an-elements-class-with-javascript
 //https://lodash.com/docs/4.17.15#isEqual