const rp = require('request-promise');
var cron = require('node-cron');
//var Table = require('cli-table');
var fs = require('fs');
// replace the value below with the Telegram token you receive from @BotFather
const token = '1750061258:AAHphqzXsZWjoSZrREN3wCrDxux6bErdC6g';
const chatId="1723877882";
let message='';

let rawdata = fs.readFileSync('current.json');
let storedApartments = JSON.parse(rawdata).apartments;
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
cron.schedule('*/15 * * * *', () => {
    getNewApartments()
  });

function getNewApartments(){
 rp(options).then((data)=>{
     apartments= data;
    filterApartment();
    let newestAparmentList=[];
    storedApartmentsIds=storedApartments.map(element=>element.AnnonsId)
    apartmentsIds=apartments.map(element=>element.AnnonsId)
    newApartmentIds=_.difference(apartmentsIds,storedApartmentsIds)
    if(!_.isEmpty(newApartmentIds)){
        newApartmentIds.forEach((id)=>{
            newestAparmentList.push(apartments.filter(apartment=>apartment.AnnonsId==id)[0])
        })
       let links = newestAparmentList.map(element=>`https://bostad.stockholm.se`+element.Url)
        message = `Hello Ekow, there are new apartments, ${links.toString()}`
        const sendMessage={
            url:`https://api.telegram.org/bot${token}/sendMessage?chat_id=${chatId}&text=${message}`
        }
        rp(sendMessage)
        fs.writeFileSync('current.json',JSON.stringify({apartments:newestAparmentList.concat(storedApartments)},0,2))
        
    }


   
}).catch((err)=>{
    console.log(err);
})   
}



// rp(sendMessage)
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