#QPlan Back End
My project
##PUT route
Add or update a custom course
###Request body:
* year
* code
* prefix
* name
* term
* description
* credits
* math
* natSci
* complStudies
* engSci
* engDesign
* status

##DELETE route
###Request params:
* prefix
* code
* year

##GET route
##GET route
##GET route
##GET route
###Request params:
* prefix
* code
* year

##GET route
###Request params:
* prefix
* code
* year

##PUT route
###Request body:
* semester
* status

###Request params:
* prefix
* code
* year
* section

##DELETE route
###Request params:
* prefix
* code
* year
* section

##GET route
##PUT route
###Request body:
* discipline
* startYear
* labels

##DELETE route
###Request params:
* discipline
* startYear

##GET route
##PUT route
Update the course label names
###Request body:
* discipline
* startYear
* coreCommon_name
* coreDiscipline_name
* listB_name
* listC_name
* worksheetName

##GET route
get an engineering discipline's graduation requirements
###Request params:
* discipline

##PUT route
update an engineering discipline's graduation requirements
###Request body:
* discipline
* totalCredits
* mathematics
* naturalSciences
* complementaryStudies
* engineeringSciences
* engineeringDesign
* esAndEd
* mathAndNs
* totalAu
* num400

##GET route
get the Excel file headings for engineering graduation requirements
##PUT route
update the Excel file headings for engineering graduation requirements
###Request body:
* identifier
* worksheetName
* year
* discipline
* credits
* mathematics
* naturalSciences
* complementaryStudies
* engineeringSciences
* engineeringDesign
* esAndEd
* mathAndNs
* totalAu
* courses400
* listBC

