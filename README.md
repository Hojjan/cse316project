"# cse316project" 

1. Menu Description
- Homepage: short introduction of CSE 316 class, can sign in if the user has already signed up, or one has to sign up

- Navbar: Has several menus. The user cannot access any menus in the navbar unless the user signs in.

- Insert Grade: The user can input his or her grade for CSE 316 class only. If the user wants to insert or update his grade, then he may just put all the values in the box and press confirm button.

- View Grade: The user may see classmate's grades. However, unless he inputs his grades, he cannot view other people's data even though he signed up and signed in. If he puts the cursor on the graph, he can see how many people are in such a range of scores.

- Ask Professor: This page is a bulletin which the students can communicate with the professor easily. The user can see the instructor's information, or submit his question. Furthermore, he can delete only the questions that he posted.

- User Info: The user can change his personal information.

2. Attendance grade
- To grade the attendance, we decided to get the "absent times" of the class, and regarded them 0.25 points each. So that we may subtract the calculated points from 25 points in total.

3. npm install react-chartjs-2 chart.js
- This command is for showing charts. Since we also put the package.json file which includes those modules in dependencies, it would probably cause no error. However, if there is a module error, you may run this command.

4. Testing View Grades page
- Since a charts require a significant amount of data to effectively fulfill their purpose, it would be better to make 3~4 accounts at least. If it is inconvenient, you may creat only two accounts, because there is no problem for that.

5. New documents added
- new test plan, requirements added due to our plan changes.
