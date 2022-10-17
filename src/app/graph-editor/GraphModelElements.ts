import { GraphEditorComponent, NODE_TAG, EdgeType } from './graph-editor.component'


export class Graph{
	nodes : Node[];
	edges : Edge[][];
  
	constructor(){
	  this.nodes = []
	  this.edges = []

	  const n_types = Object.keys(EdgeType).filter((v) => isNaN(Number(v))).length;
	  for ( let i=0; i<n_types; i++ ){
		this.edges.push([])
	  }
	}
  }
  
  export class Node{
	id : number;
	badge : Badge;
  
	edges_out : number[][] = [];
	edges_in : number[][] = [];
  
	physical: PhysicalNodeProperties = {} as PhysicalNodeProperties;
  
	constructor(n: number, d: number, x: number, y: number, edge_types_n: number , badge ?: Badge){
	  this.id =  n    
	  this.physical = {
		x: x,
		y: y,
		height: d,
		width: d
	  }

	  for ( let t=0; t<edge_types_n; t++){
		this.edges_out.push([])
		this.edges_in.push([])
	  }


	  if ( badge ){
		this.badge = badge
	  }
	  else{
		let b = {
		  text: NODE_TAG,
		  sub: n.toString(),
		  sup: ""
		} as Badge
		this.badge = b
	  }
	}
  }
  
  export interface PhysicalNodeProperties {
	x : number;
	y : number;
	height : number;
	width : number;
  }
  
  export class Edge{
	id : number;
	type : EdgeType;
	badge : Badge;
  
	start_node: number;
	end_node: number;
  
	physical : PhysicalEdgeProperties = {} as PhysicalEdgeProperties
  
	constructor(n: number, parent : GraphEditorComponent, start:number, end:number, type: EdgeType, v_vector?: number[], badge?: Badge){
		this.id =  n   
		this.start_node = start 
		this.end_node = end 
		this.type = type
	
		let x0 = parent.getNodeById(start).physical.x
		let y0 = parent.getNodeById(start).physical.y
	
		let dx = parent.getNodeById(start).physical.x - parent.getNodeById(end).physical.x
		let dy = parent.getNodeById(start).physical.y - parent.getNodeById(end).physical.y
		
		this.physical.width = -dx
		this.physical.height = -dy

		v_vector = v_vector?.length == 2 ? v_vector : [0,0]

		this.physical = {
			x: x0,
			y: y0,
			height: -dy,
			width: -dx,
			v1_x: v_vector[0],
			v1_y: v_vector[1],
			v2_x: v_vector[0],
			v2_y: v_vector[1],
		}
	
		if ( badge ){
			this.badge = badge
	  	}
		let b = {
			text: EdgeType[type],
			sub: n.toString(),
			sup: ""
		} as Badge
		this.badge = b
	}
  
	
  }
  
  export interface PhysicalEdgeProperties{
	x : number;
	y : number;
	height : number;
	width : number;
	v1_x : number;
	v1_y : number;
	v2_x : number;
	v2_y : number;
  }
  
  export interface Badge{
	text: string;
	sub: string;
	sup: string;
  }
  