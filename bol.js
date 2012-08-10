/*
 * Bits o' Life - Population evolution simulation
 * 
 * WARNING - Please, don't base your doctorate thesis, or any other academic paper, on the results of this program.
 *
 */
$(document).ready( function() {

	// Handle Begin button click
	$("input#begin").click(function(e) {
		e.preventDefault();

		var size = $("input#size").val(); 
		if(size !== "" && !isNaN(size) && parseInt(size) > 0) { 
			sim.GridSize = parseInt($("input#size").val());
			$("div#sizeContainer").fadeOut("slow", function() {
				$("div.grid").fadeIn("slow");	
			});
			sim.createMap();
		}
		else {
			alert("Please enter the number of cities.");
			$("input#size").focus();
		}
	});

	// Handle Evolve button click
	$("input#evolve").click(function(e) {
		e.preventDefault();
		sim.evolve();
	});
});


/* Main object for sim
 * All sim logic code goes inside this object so that the global namespace doesn't get cluttered.
 */
var sim = {};

// sim variables
sim.GridSize = 0;
sim.Map = [];
sim.Regrowth = [];
sim.Generations = 0;

(function() {

	this.createMap = function() {
		for(var x=0;x<sim.GridSize;x++) {
			sim.Map[x] = [];
			for(var y=0;y<sim.GridSize;y++) {
				sim.Map[x][y] = Math.floor(Math.random() * 2);
				console.log("["+x+"]["+y+"]: " + sim.Map[x][y].valueOf());
			}
		}
		sim.updateGenerationCount();
		sim.createGrid();
	}

	this.createGrid = function() {
		for(var i=0;i<sim.GridSize;i++) {
			this.createRow(i);
		}
		$("table.grid").fadeIn("slow");

		// Show regrowth
		for(var i=0;i<sim.Regrowth.length;i++) {	
			var r = sim.Regrowth[i].split(",");
			$('tr[data-row='+r[0]+'] td[data-cell='+r[1]+']').addClass("regrowth");
		}			
	}

	this.createRow = function(rowId) {
		var row = $("<tr/>").attr("data-row", rowId);
		$("table.grid").append(row);
		createCells();

		function createCells() {
			var cells = [];
			for(var i=0;i<sim.GridSize;i++) {
				console.log("Cell value ["+rowId+"]["+i+"]: " + sim.Map[rowId][i]);
				var cell = $("<td>" + sim.Map[rowId][i] + "</td>").attr("data-cell", i);
				$('tr[data-row=' + rowId + ']').append(cell);
			} 
		}
	}

	this.evolve = function() {
		sim.updateGenerationCount();
		sim.Regrowth = [];
		$("table.grid").fadeOut("slow").empty();
		var tempMap = [];

		// Loop through and build neighborhood score
		for(var x=0;x<sim.GridSize;x++) {
			tempMap[x] = [];	
			for(var y=0;y<sim.GridSize;y++) {
				var n = [0,0,0,0,0,0,0,0];
				var bounds = sim.GridSize-1;

				// Check North	
				if(x > 0) {
					n[0] = sim.Map[x-1][y];	
				}
				// Check North East
				if(x > 0 && y < bounds) {
					n[1] = sim.Map[x-1][y+1];	
				}	
				// Check East
				if(y < bounds) {
					n[2] = sim.Map[x][y+1];	
				}
				// Check South East
				if(x < bounds && y < bounds) {
					n[3] = sim.Map[x+1][y+1];	
				}
				// Check South
				if(x < bounds) {
					n[4] = sim.Map[x+1][y];	
				}
				// Check South West
				if(x < bounds && y > 0) {
					n[5] = sim.Map[x+1][y-1];	
				}
				// Check West
				if(y > 0) {
					n[6] = sim.Map[x][y-1];	
				}
				// Check North West
				if(x > 0 && y > 0) {
					n[7] = sim.Map[x-1][y-1];	
				}

				var score = 0;  
				$.each(n, function(i,value) {
					score = score + value;
				});

				// Determine fate of the current city
				switch(score) {
					case 0:  // No neighbors, death
						tempMap[x][y] = 0;
						break;
					case 1: // One neighbor = death
						tempMap[x][y] = 0;
						break;
					case 2: // 2 neighbors = stay the same
						tempMap[x][y] = sim.Map[x][y];
						break;
					case 3: // 3 neighbors
						tempMap[x][y] = 1;
						if(sim.Map[x][y] === 0) {
							// Regrow city
							sim.Regrowth.push(x + "," + y);	
						}
						break;
					case 4: // 4 neighbors = not enough food = death
						tempMap[x][y] = 0;
						break;
					default: // More than 4 neighbors = not enough food = death
						tempMap[x][y] = 0;
						break;	
				}
			}
		}
		sim.Map = tempMap;	
		sim.createGrid();
	}

	// Handle updating the Generations count
	this.updateGenerationCount = function() {
		$("span#numGenerations").text(++sim.Generations);
	}

}).apply(sim);