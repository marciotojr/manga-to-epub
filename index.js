const https = require('https')
const download = require('image-downloader')
const Epub = require('epub-gen')


const url = process.argv[2]

https.get(url, (resp) => {
    let data = ''
  
    // Um bloco de dados foi recebido.
    resp.on('data', (chunk) => {
      data += chunk
    })
  
    // Toda a resposta foi recebida. Exibir o resultado.
    resp.on('end', () => {
        trataHTML(data)
    })
  
  }).on("error", (err) => {
    console.log("Error: " + err.message)
  })

  function trataHTML(html){
    const matches = html.match(/<img.*src=("|')(.*?)".*/g)
    const urls = []

    for(const index in matches){
        urls.push(/src=('|"(.*?)"|')/g.exec(matches[index])[2])
    }

    baixaImagens(urls.filter(url => url.includes('http')))
  }

  function baixaImagens(urls){
    let images = ''
    const promises = []
    for(index in urls){
        const path = __dirname+"/images/"+index+".jpg"
        images += `<img src='${path}'>`
        promises.push(downloadImage(urls[index], path))
    }
    const html = `<html><body>${images}</body></html>`
    Promise.all(promises).then(() => {
        generateEpub(html)
    })
    
  }

  function downloadImage(url, filepath) {
    return download.image({
       url,
       dest: filepath 
    })
}

function renderEpub(option, output){
    new Epub(option, output).promise.then(
        () => console.log('Ebook Generated Successfully!'),
        (err) => console.error('Failed to generate Ebook because of ', err),
    )
}

function generateEpub(html){
    const option = {
        title:process.argv[3],
        author:'manga-to-epub',
        content: [
            { title: process.argv[3], data: html, beforeToc: true },
        ]
    }
    renderEpub(option, __dirname+'/output.epub')
}

