function getData(callback){
    var request = new XMLHttpRequest();
    request.open("get","/admin/viewmyproduct");
    request.send()
    request.addEventListener("load",function(){
      callback(JSON.parse(request.responseText));
    })
  }
  
  getData(function(data){
    console.log(data);
    appendProducts(data,0,data.length)
  })
  
  
  var parentDiv = document.querySelector(".products")
  
  function appendProducts(products,start,end){
    if(end>=products.length){
      end = products.length;
    }
    for(var i = start;i<end;i++){
      var container = document.createElement("div");
      container.setAttribute("class","container");
      container.setAttribute("id",products[i]._id);
  
      var images = document.createElement("div");
      images.setAttribute("class","images");
      container.appendChild(images);
      
      var img = document.createElement("img");
      img.setAttribute("src",products[i].src);
      images.appendChild(img);
  
      var product = document.createElement("div");
      product.setAttribute("class","product");
  
      var h1 = document.createElement("h1");
      h1.innerHTML = products[i].name;
      product.appendChild(h1);
  
      var h2 = document.createElement("h2");
      h2.innerHTML = products[i].price;
      product.appendChild(h2);
  
      var p = document.createElement("p");
      p.innerHTML = products[i].description;
      //p.style.display = "none"
      product.appendChild(p);
  
      var buttons = document.createElement("div");
      buttons.setAttribute("class","buttons");
  
      var bt2 = document.createElement("button");
      bt2.setAttribute("class","add bt2");
      bt2.innerHTML = "Update";
      buttons.appendChild(bt2) 
      bt2.addEventListener("click",update)
  
      var br = document.createElement("div");
      br.innerHTML = "  "
      br.style.marginTop = "10px"
      buttons.appendChild(br)
  
      var bt1 = document.createElement("button");
      bt1.setAttribute("class","add bt1");
      //bt1.setAttribute("class","bt1");
  
      bt1.innerHTML = "Delete";
      buttons.appendChild(bt1);  
      bt1.addEventListener("click",deletePro);
  
      product.appendChild(buttons)
      container.appendChild(product)
  
      parentDiv.appendChild(container);
  
  
    }
  } 
  
  function update(ev){
    var id = ev.target.parentElement.parentElement.parentElement.id;
    window.location.href = `/admin/updateproduct/${id}`
  }
  
  function deletePro(ev){
    var data = {
      id : ev.target.parentElement.parentElement.parentElement.id
    }
    ev.target.parentElement.parentElement.parentElement.remove();
      var request = new XMLHttpRequest()
      request.open("post","/admin/deleteproduct");
      request.setRequestHeader('Content-type', 'application/json')
      request.send(JSON.stringify(data));
      request.addEventListener("load",function(){
        console.log("deleted")
      })
  }