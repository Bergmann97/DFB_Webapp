# Deutscher Fußball Bund e.V. - Web-Application

## Business Description

The German Football Association (DFB) is the head of football in Germany and is one of the founding members of the FIFA and UEFA. It includes 26 football associations with around 24'500 football clubs. The headquarter of the DFB is in Frankfurt am Main. It has also more than 7 Million members and is therefore, the greatest national sports association. As the national football association it also organizes the national teams for women and men, in case of players and coach.

The DFB consists of a League Association that includes the Bundesliga and 2. Bundesliga. Furthermore, there is the 3. Liga which is directly subordinated to the DFB, 5 Regional associations and 21 State associations. Each of the regional associations is subordinated to the DFB, as well as each of the state associations is subordinated to one of the regional associations.

Each football association includes one or more leagues, that include the football clubs associated to the football association. Due to relegation into lower leagues and ascending into higher leagues, the league and therefore the football association a club belongs to can change. As an example: If a club within one of the leagues of a regional association climbes up into the 3. Liga, the associated football association is changing from a regional association to the DFB.

***

## Application Explanation & Requirements
### Title
**DFB Structuring Application**

### Domain Name
**dfb-organization**

### Purpose of the app
The app should be used for organizing and manage the structures of the DFB. It will therefore, have the task for handling the associations of the DFB and the associated football clubs. Each association will have a name, a president and number of associated football clubs and members, as well as an optional association to an superior football association. The associated football clubs, will have a reference to the association, as well as a name, a coach and a list of players, as well as a number of members of the club. Each person should get a name and a type that symolizes what he does, which could be member, player or coach (additional a reference to an association or football club could be given). Each player and coach can only be assigned to one football club, but each person can be assigned to different associations or football clubs as a member at the same time.

Beside the structure of associations and football clubs, their should also be the possibility for organizing the national teams with players and coaches, where the players need to be assigned to a football club and the coach should not be assigned to any football club. For simplicity we will ignore the youth national teams (can additionally be implemented).

***additional:***
When handling the described parts, it is also needed that the differntiation into men and women is made (person gets also an attribute for the gender). This means, that there are some associations that handle the football clubs for men and some for women. This means that only women can be assigned to a football club that belongs to a women football association, but a football club can have a male coach, even if it belongs to a football association.

***

## List of Information Management tasks
- handle *person* (**CRUD**)
    - attributes: name, type (player, coach, member, president)
        - optional attributes: gender, football association, football club (as employee or member), national team (boolean)
- handle *football club* (**CRUD**)
    - attributes: name, president, #members, football association
- handle *football association* (**CRUD**)
    - attributes: name, president, #members, football association (optional), #members, #football clubs
- handle national team (**CRUD**)
    - attributes: gender, coach, players
        - optional attributes: youth

- handle **associations** of
    - person to
        - football club/association as member
        - football club as employee (coach or player)
        - football club/association as president
        - national team as coach or player
    - football club to football association
    - football association to superior football association