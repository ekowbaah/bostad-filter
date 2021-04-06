const rp = require('request-promise');
var cron = require('node-cron');
//var Table = require('cli-table');
var fs = require('fs');
// replace the value below with the Telegram token you receive from @BotFather
const token = '1750061258:AAHphqzXsZWjoSZrREN3wCrDxux6bErdC6g';
const chatId="1723877882";
let message='';

var getStoredApartments = {
    url: 'https://api.jsonbin.io/v3/b/606c74606397691864749a75/1',
    headers: {
        'X-Master-Key': '$2b$10$iSeXo4/on2EgNGtpDOZfBewRE30J/x4aqzNMhpGMvdM59YLn7tBWG'
    },
    json: true // Automatically parses the JSON string in the response
};

let storedApartments = []
var _ = require('underscore');
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0
let apartments = []

const options = {
    url: `https://bostad.stockholm.se/Lista/AllaAnnonser`,
    json: true
}
/* var table = new Table ({
    head:['id','address','expirydate','link'],
    colWidths:[10,50,15,60]
}) */



function getNewApartments(){
    console.log('i run')
    rp(getStoredApartments)
    .then((data)=>{
        storedApartments=data.record.apartments
        rp(options).then((data)=>{
            apartments= data;
           filterApartment();
           let newestAparmentList=[];
           storedApartmentsIds=storedApartments.map(element=>element.AnnonsId)
           apartmentsIds=apartments.map(element=>element.AnnonsId)
           console.log(storedApartmentsIds,apartmentsIds)
           newApartmentIds=_.difference(apartmentsIds,storedApartmentsIds)
           if(!_.isEmpty(newApartmentIds)){
               newApartmentIds.forEach((id)=>{
                   newestAparmentList.push(apartments.filter(apartment=>apartment.AnnonsId==id)[0])
               })
              let links = newestAparmentList.map(element=>`https://bostad.stockholm.se`+element.Url)
               message = `Hello Ekow, there are new apartments, ${links.join(', ')}`
               const sendMessage={
                   url:`https://api.telegram.org/bot${token}/sendMessage?chat_id=${chatId}&text=${message}`
               }
               rp(sendMessage)
               var updatedStoredApartments = {
                   method: 'PUT',
                   url: 'https://api.jsonbin.io/v3/b/606c74606397691864749a75',
                   headers: {
                       'X-Master-Key': '$2b$10$iSeXo4/on2EgNGtpDOZfBewRE30J/x4aqzNMhpGMvdM59YLn7tBWG',
                       "Content-Type": "application/json"
                   },
                   body: {
                       apartments:newestAparmentList.concat(storedApartments)
                   },
                   json: true
                 
               };
               rp(updatedStoredApartments)
           .then(function (parsedBody) {
               // POST succeeded...
           })
           .catch(function (err) {
               // POST failed...
           });
             
               
           }
       
       
          
       }).catch((err)=>{
           console.log(err);
       })  
    }
    )
    .catch(function (err) {
       console.log(err, 'could not get stored apartments')
    });
  
}

function filterApartment() {
    var filtered = []
    var ids= [];
    var antal =0;
    var elementCount=0
 
    apartments.forEach((element,i)=>{
     if(element.Senior || element.Student || element.Korttid ||element.Ungdom){
        apartments.splice(i,1)
       }
     }) 
     apartments.forEach((element,i)=>{
         if(!compareDates(element.AnnonseradTill)){
            apartments.splice(i,1)

         }
     })
   //  apartments.forEach((element)=>{
     //    table.push([element.AnnonsId,element.Gatuadress+ ' '+element.Stadsdel + ' '+element.Kommun,element.AnnonseradTill, 'https://bostad.stockholm.se'+element.Url]);

   //  });
   //  apartments.push(tester)
     
   // console.log(table.toString())

}

function compareDates(expireDate){
    var expired = false;
    var today= new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); 
    var yyyy = today.getFullYear();
    today = yyyy +'-' + mm + '-' + dd  ;
    const todayParsed=Date.parse(today)
    const expireDateParsed=Date.parse(expireDate)
    
    notExpired = expireDateParsed>todayParsed
    
    return notExpired
}


    getNewApartments()
