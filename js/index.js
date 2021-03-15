
if(localStorage.getItem('graph')){
  window.graph = JSON.parse(localStorage.getItem('graph'));
  window.edges = JSON.parse(localStorage.getItem('edges'));
}
else{
  window.graph = [{
    id: 1,
    edge: null,
    data: {
      name: "Me"
    },
    label: ["Category", "Me"],
  },
  {
    id: 2,
    edge: null,
    data: {
      name: "You"
    },
    label: ["Category", "You"],
  },
  {
    id: 3,
    edge: null,
    data: {
      name: "View"
    },
    label: ["Category", "View"],
  },
  {
    id: 4,
    edge: null,
    data: {
      name: "Series & Movies"
    },
    label: ["Category", "Series & Movies"],
  },
  {
    id: 5,
    edge: null,
    data: {
      name: "Past Relations"
    },
    label: ["Category", "Past Relations"],
  },
  {
    id: 6,
    edge: null,
    data: {
      name: "Book"
    },
    label: ["Category", "Book"],
  },
  {
    id: 7,
    edge: null,
    data: {
      name: "Music"
    },
    label: ["Category", "Music"],
  },
  
  ];
  window.edges = [];
}


let id = window.graph.length+1;
let edge_id = window.edges.length+1;

const dontshow = [];

let showlist = [];

document.addEventListener("DOMContentLoaded", (e) => {
  
  const form = document.getElementById("dataform");
  const send = document.getElementById("send");
  const categorylist = document.getElementById("categorylist");
  fillCategoryList();
  showGraph();

  // Listens to submit of the form
  send.addEventListener("click", (e) => {
    const formData = serializeForm(form);

    if(formData.addtolist !== undefined)
      dontshow.push(formData.name);

    const to = graph.filter((x) => {
      if (x.label.includes(formData.category)) {
        return true;
      }
      return false;
    });

    if (to.length) {
      const toobj = to[0];
      const gr = makeGraph(
        [...toobj.label, formData.name], {
          name: formData.name
        },
        ["CHILD_OF"], {},
        to[0]
      );
    }
    fillCategoryList();
    showGraph();
    localStorage.setItem('graph', JSON.stringify(graph));
    localStorage.setItem('edges', JSON.stringify(edges));
    e.preventDefault();
    return false;
  });
  
  const filter = document.getElementById("filter");
  const filterbutton = document.getElementById("filterbutton");
  
  filterbutton.addEventListener("click", (e)=>{
    if(filter.value.length){
      const list = filter.value.split(",");
      showlist = list.map((x)=>x.trim());
    }
    else{
      showlist = []
    }
    showGraph();
  });
});


function serializeForm(form) {
  const formData = new FormData(form);
  let data = {};
  for (var pair of formData.entries()) {
    data[pair[0]] = pair[1];
  }
  return data;
}



function makeGraph(fromlabel, fromdata, rellabel, reldata, to) {

  const graphpart = {
    from: {
      id: id,
      data: fromdata,
      label: [...fromlabel]
    },
    to: to
  }

  graphpart.edge = {
    id: edge_id,
    from: graphpart.from.id,
    to: graphpart.to.id,
    data: reldata,
    label: [...rellabel],
  }

  graphpart.from.edge = graphpart.edge.id;

  window.graph.push(graphpart.from);
  window.edges.push(graphpart.edge);
  id++; edge_id++;
  return graphpart;
}

function fillCategoryList(){
  categorylist.innerHTML = "";
  for (var item of graph) {
    if(!dontshow.includes(item.data.name)){
      const opt = document.createElement("option");
      opt.text = `${item.label.join(" > ")}`;
      opt.value = item.data.name;
      categorylist.add(opt);
    }
  }
}

function showGraph(){
  
  
  let _nodes = null;

  if(showlist.length){
    const _nodes_half = window.graph.filter((x)=> {
      return x.label.filter((y)=> showlist.includes(y)).length; 
    }); 
    _nodes = _nodes_half.map((x) => ({id: x.id, label: x.label[x.label.length - 1]}))
  }
  else {
    _nodes = window.graph.map((x) => ({id: x.id, label: x.label[x.label.length - 1]}))
  }

  const _edges = new vis.DataSet(window.edges.map((x) => ({from: x.from, to: x.to, label: x.label[0] })));

  // create a network
  const container = document.getElementById('mynetwork');

  const data = {
      nodes: _nodes,
      edges: _edges
  };
  const options = {};
  // initialize your network!
  const network = new vis.Network(container, data, options);

  network.on('oncontext', function(params) {
    const nodeid = params.nodes[0];
    for (const x of graph) {
      if (x.id === nodeid) {
        graph.splice(x.id - 1, 1);
      }
    }

    for (const x of edges) {
      if (x.from === nodeid) {
        edges.splice(x.id - 1, 1);
      }
    }
   
    localStorage.setItem('graph', JSON.stringify(graph));
    localStorage.setItem('edges', JSON.stringify(edges));
    showGraph();
    fillCategoryList();
    params.event.preventDefault();
  });
}