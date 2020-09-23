const rp = require('request-promise');
const cherio = require('cheerio');
var Table = require('cli-table');
var fs = require('fs');
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0
let apartments = []
const options = {
    url: `https://bostad.stockholm.se/Lista/AllaAnnonser`,
    json: true
}
var table = new Table ({
    head:['id','address','expirydate','link'],
    colWidths:[10,50,15,60]
})

rp(options).then((data)=>{
    apartments= data;
    filterApartment();
   
}).catch((err)=>{
    console.log(err);
})

function filterApartment() {
    var filtered = []
    var ids= [];
    var antal =0;
    var elementCount=0
    apartments.forEach(element => {
        if (element.AntalRum===3)
    {
filtered.push(element)
    }
   
    });
    //  filtered.forEach((element)=>{
    //   if(element.Antal>1){
    //       elementCount++
    //       antal=antal+element.Antal

    //    }
    //  })
    filtered.forEach((element,i)=>{
     if(element.Senior || element.Student || element.Korttid ||element.Ungdom){
         filtered.splice(i,1)
       }
     }) 


     filtered.forEach((element,i)=>{
         if(!compareDates(element.AnnonseradTill)){
            filtered.splice(i,1)

         }
     })
     filtered.forEach((element)=>{
         table.push([element.AnnonsId,element.Gatuadress+ ' '+element.Stadsdel + ' '+element.Kommun,element.AnnonseradTill, 'https://bostad.stockholm.se'+element.Url]);
       
         fs.writeFileSync('current.json',JSON.stringify({apartments:filtered},0,2))

     });

     
    console.log(table)

}

function compareDates(expireDate){
    var expired = false;
    var today= new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    today = yyyy +'-' + mm + '-' + dd  ;
    const todayParsed=Date.parse(today)
    const expireDateParsed=Date.parse(expireDate)
    
    notExpired = expireDateParsed>todayParsed
    
    console.log(today)
    return notExpired
}