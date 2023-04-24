<script>

	import {splitPrestation, tagPrefix, prestationCodeDetails, workedHoursDetails, contractPrestationDetail} from './ptgParser'
  	import { AccordionItem, Accordion,  Button, Modal } from 'flowbite-svelte'

	import { Label, Input, CloseButton, Checkbox } from 'flowbite-svelte'



/*
FILTERS
*/

let filterByName = ''
let prestationDetails = true
let tagElements = false
let filterRectificatif = [true, false]


$ : filterItem = (prestations) =>  {

	return prestations.filter(item => filterRectificatif.includes(item.rectificatif) && 

		(
			filterByName <= 2 ||
		item.coreInfos.nom.toUpperCase().indexOf(filterByName.toUpperCase()) > -1 ||
		item.coreInfos.prenom.toUpperCase().indexOf(filterByName.toUpperCase()) > -1
		)
	)
		
}



let files;
let expr = "\n008"
let repl = "<span style='color:blue'>\n008</span>"
let prestations = []



</script>

<div class="grid gap-6 mb-6 md:grid-cols-4">
  <Label for='large-input' class='block mb-2'>Filtrer par nom
  <Input id="large-input" size="lg" placeholder="Large input" bind:value={filterByName}>
	  <CloseButton slot="right" on:click={() => filterByName = ''}/>

	</Input>

	<div class="block">
		<p>test</p>
	</div>

</Label>

	<div class='block mb-2'>
	<Label>
	<Checkbox class="" bind:group={filterRectificatif} value={false}/>
		Paie normale
	</Label	>

	<Label>
	<Checkbox class="" bind:group={filterRectificatif} value={true}/>
		Paie rectificative
	</Label	>

	</div>



</div>

<input type="file" bind:files>



{#if files && files[0]}

{#await files[0].text() then text }
		
		<Accordion>
		{#each filterItem(splitPrestation(text)) as prestation, i }

		<AccordionItem>
			<span slot="header">

				<span class:rectificatif={prestation.rectificatif}>{i} {prestation.coreInfos.nom} {prestation.coreInfos.prenom}   {prestation.rectificatif ? "- R" : ""}
				</span>

			</span>


<!--  008 Données personnelles   -->

			
			<Accordion multiple>
			<AccordionItem>
			<span slot=header>
			<svg viewBox="0 0 128 128" width="25" height="25" xmlns="http://www.w3.org/2000/svg"><title/><path d="M128,122a28.62,28.62,0,0,0-28.58-28.5H85.59a1.85,1.85,0,0,1-1.87-1.83V81.17l5.52-6.76a14.85,14.85,0,0,0,3.34-9.36V60.38A8,8,0,0,0,98,52.81v-8a8,8,0,0,0-5-7.42V34.1a13.49,13.49,0,0,0,8.31-20.81,3,3,0,0,0-4.56-.46A7.52,7.52,0,0,1,95,14.08,13.52,13.52,0,0,0,89.85,2.57a3,3,0,0,0-4.48.94,7.44,7.44,0,0,1-3,3A29,29,0,0,0,35,29v8.39a8,8,0,0,0-5,7.42v8a8,8,0,0,0,5.42,7.57v4.67a14.86,14.86,0,0,0,3.34,9.36l5.52,6.76v10.5a1.85,1.85,0,0,1-1.87,1.83H28.58A28.63,28.63,0,0,0,0,122.09V125a3,3,0,0,0,3,3H125a3,3,0,0,0,3-3ZM6,122A22.61,22.61,0,0,1,28.58,99.51H42.41a7.86,7.86,0,0,0,7.87-7.83V80.11a3,3,0,0,0-.68-1.9L43.4,70.62a8.84,8.84,0,0,1-2-5.57V57.81a3,3,0,0,0-3-3H38a2,2,0,0,1-2-2v-8a2,2,0,0,1,2-2,3,3,0,0,0,3-3V29A23,23,0,0,1,79.71,12.21a3,3,0,0,0,2.91.68,13.46,13.46,0,0,0,5.54-3.23,7.51,7.51,0,0,1,.1,6.9,3,3,0,0,0,2.51,4.34,13.58,13.58,0,0,0,6.77-1.38,7.5,7.5,0,0,1-2.06,6.69A7.3,7.3,0,0,1,90,28.39a3.15,3.15,0,0,0-2.15.86,3,3,0,0,0-.9,2.14v8.42a3,3,0,0,0,3,3,2,2,0,0,1,2,2v8a2,2,0,0,1-2,2h-.42a3,3,0,0,0-3,3v7.24a8.83,8.83,0,0,1-2,5.57L78.4,78.21a3,3,0,0,0-.68,1.9V91.67a7.86,7.86,0,0,0,7.87,7.83H99.42A22.61,22.61,0,0,1,122,122Z"/>
			</svg>
			<span>Infos personnelles</span>
			</span>
			<div 
				class='infos' 
				style="color:red"
				>

			{@html 

				prestation.splitInfos.personalInfos
				.map(tagPrefix)
				.join('\n')
			}

			</div>

			</AccordionItem>


<!--  009 Prestations brutes   -->

			<AccordionItem>

			<span slot="header">Infos de paie</span>

			{#each prestation.splitInfos.workerHours as info}

				<p style="color:blue">{info}</p>

				{#if prestationDetails}
				<p>{workedHoursDetails(info)}</p>
				{/if}
			
			{/each}

			</AccordionItem>



<!--  011 Prestations interprétées   -->


			<AccordionItem>

			<span slot="header">Code prestation</span>

			<p class='warning'>Attention, il y a eu beaucoup d'adaptations par rapport à la doc. Le type d'information encodée peut ne pas correspondre à ce qui est indiqué.</p>

			{#each prestation.splitInfos.prestationsCode as info}

				<p style="color:green">{info}</p>

				{#if prestationDetails}
				<p>{prestationCodeDetails(info)}</p>
				{/if}
			
			{/each}

			</AccordionItem>


<!--  026 Dates   -->


			<AccordionItem>

			<span slot="header">Ligne contrat</span>

			{#each prestation.splitInfos.contractLine as info}

				<p style="color:green">{info}</p>

				{#if prestationDetails}
				<p>{contractPrestationDetail(info)}</p>
				{/if}
			
			{/each}

			</AccordionItem>


<!-- Original PTG -->

			<AccordionItem>
				<span slot="header">PTG original</span>


				{#each prestation.original as line}
				<p>{line}</p>
				{/each}

			</AccordionItem>

			</Accordion>


		</AccordionItem>	

		{/each}
		</Accordion>

{/await}

{/if}












<style type="text/css">
	.infos {

  			column-count: 3;	

	}

	.tag {
		font-weight : bold;
	}

	.warning {
		font-weight: bold;
		margin-bottom : 3em;
	}

	.large-input {
		width : 10em;
	}

	.rectificatif {
		color : red
	}

	.inline {
		display: inline;
		margin : 2em;
	}

</style>